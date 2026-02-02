import React, { useState, useEffect } from 'react'; // <-- USES useState and useEffect 
import { useParams, useNavigate } from 'react-router-dom'; // <-- USES useParams and useNavigate 
 
const API_BASE = 'http://localhost:5000/api/blog'; 
 
function getToken() { 
    return sessionStorage.getItem("token"); 
} 
 
export default function AdminPostEdit() { 
    const { id } = useParams(); // <-- USED 
    const navigate = useNavigate(); // <-- USED 
     
    const [title, setTitle] = useState(''); // <-- USED 
    const [content, setContent] = useState(''); // <-- USED 
    const [loading, setLoading] = useState(true); // <-- USED 
    const [error, setError] = useState(null); // <-- USED 
    const [success, setSuccess] = useState(null); // <-- USED 
 
    // --- 1. Fetch Existing Post Data --- 
    useEffect(() => { // <-- USED 
        const fetchPost = async () => { 
            const token = getToken(); 
            if (!token) { 
                setError("Authentication missing. Redirecting to login."); 
                setTimeout(() => navigate('/login'), 2000); 
                return; 
            } 
 
            try { 
                // Fetch the post details 
                const response = await fetch(`${API_BASE}/${id}`);  
                 
                if (!response.ok) { 
                    throw new Error('Failed to fetch post details.'); 
                } 
                 
                const data = await response.json(); 
                setTitle(data.title); 
                setContent(data.content); 
            } catch (err) { 
                setError(`Error fetching post: ${err.message}`); 
            } finally { 
                setLoading(false); 
            } 
        }; 
 
        fetchPost(); 
    }, [id, navigate]); // <-- Dependency array for useEffect 
 
    // --- 2. Handle Form Submission (Update) --- 
    const handleSubmit = async (e) => { 
        e.preventDefault(); 
        setSuccess(null); 
        setError(null); 
        setLoading(true); 
 
        const token = getToken(); 
         
        try { 
            const response = await fetch(`${API_BASE}/${id}`, { 
                method: 'PUT',  
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json', 
                }, 
                body: JSON.stringify({ title, content }), 
            }); 
 
            if (!response.ok) { 
                const errorData = await response.json(); 
                throw new Error(errorData.message || 'Failed to update post.'); 
            } 
 
            setSuccess('Post updated successfully!'); 
            setTimeout(() => navigate('/admin/posts/list'), 1500);  
 
        } catch (err) { 
            setError(`Update failed: ${err.message}`); 
        } finally { 
            setLoading(false); 
        } 
    }; 
 
    if (loading) return <div className="container mt-5 text-center">Loading Post for Editing...</div>; 
 
    return ( 
        <div className="container mt-5"> 
            <h1 className="mb-4">Edit Post: {title} (INSECURE TEST MODE)</h1> 
             
            {success && <div className="alert alert-success">{success}</div>} 
            {error && <div className="alert alert-danger">{error}</div>} 
 
            <form onSubmit={handleSubmit}> 
                <div className="mb-3"> 
                    <label htmlFor="postTitle" className="form-label">Title</label> 
                    <input 
                        type="text" 
                        className="form-control" 
                        id="postTitle" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                    /> 
                </div> 
                <div className="mb-3"> 
                    <label htmlFor="postContent" className="form-label">Content</label> 
                    <textarea 
                        className="form-control" 
                        id="postContent" 
                        rows="10" 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                        required 
                    /> 
                </div> 
                <button type="submit" className="btn btn-primary me-2" disabled={loading}> 
                    {loading ? 'Updating...' : 'Update Post'} 
                </button> 
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/posts/list')}> 
                    Cancel 
                </button> 
            </form> 
        </div> 
    ); 
}
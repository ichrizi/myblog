import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
 
const API_URL = "http://localhost:5000/api/blog";  
 
export default function CreatePostPage() { 
    const [formData, setFormData] = useState({ 
        title: '', 
        content: '', 
        author: 'Admin' 
    }); 
    const [error, setError] = useState(null); 
    const [submitting, setSubmitting] = useState(false); 
    const navigate = useNavigate(); 
 
    const handleChange = (e) => { 
        const { name, value } = e.target; 
        setFormData(prev => ({ ...prev, [name]: value })); 
    }; 
 
    const handleSubmit = async (e) => { 
        e.preventDefault(); 
        setError(null); 
        if (submitting) return; 
 
        setSubmitting(true);  
 
        try { 
            const token = sessionStorage.getItem('token'); 
            if (!token) { 
                throw new Error("User token not found. Please log in."); 
            } 
 
            const response = await fetch(API_URL, { 
                method: 'POST', 
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`  
                }, 
                body: JSON.stringify(formData), 
            }); 
 
            if (!response.ok) { 
                const errorData = await response.json(); 
                throw new Error(errorData.message || 'Failed to create post on server.'); 
            } 
 
            alert("Post created successfully!"); 
            navigate('/admin/posts/list');  
 
        } catch (err) { 
            setError(err.message); 
            console.error('Error creating post:', err); 
            setSubmitting(false);  
        }  
    }; 
     
    return ( 
        <div className="container mt-5"> 
            <h2 className="mb-4">Create New Blog Post</h2> 
             
            {error && ( 
                <div className="alert alert-danger" role="alert"> 
                    Error: {error} 
                </div> 
            )} 
             
            <form onSubmit={handleSubmit}> 
                <div className="mb-3"> 
                    <label htmlFor="title" className="form-label">Title</label> 
                    <input 
                        type="text" 
                        className="form-control" 
                        id="title" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        required 
                    /> 
                </div> 
                 
                <div className="mb-3"> 
                    <label htmlFor="content" className="form-label">Content</label> 
                    <textarea 
                        className="form-control" 
                        id="content" 
                        name="content" 
                        rows="10" 
                        value={formData.content} 
                        onChange={handleChange} 
                        required 
                    ></textarea> 
                </div> 
                 
                <div className="mb-3"> 
                    <label htmlFor="author" className="form-label">Author</label> 
                    <input 
                        type="text" 
                        className="form-control" 
                        id="author" 
                        name="author" 
                        value={formData.author} 
                        onChange={handleChange} 
                        required 
                        readOnly  
                    /> 
                </div> 
                 
                <button  
                    type="submit"  
                    className="btn btn-primary"  
                    disabled={submitting}  
                > 
                    {submitting ? 'Creating Post...' : 'Create Post'} 
                </button> 
            </form> 
        </div> 
    ); 
}
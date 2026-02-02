import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom'; 
 
const API_BASE = 'http://localhost:5000/api/blog'; 
 
// Helper to get stored token 
function getToken() { 
    return sessionStorage.getItem("token"); 
} 
 
export default function AdminPostList() { 
    const [posts, setPosts] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 
 
    // --- Function to Fetch All Posts --- 
    const fetchPosts = async () => { 
        setLoading(true); 
        setError(null); 
        const token = getToken(); 
 
        if (!token) { 
            setError("Authentication token missing. Please log in."); 
            setLoading(false); 
            return; 
        } 
 
        try { 
            const response = await fetch(API_BASE, { 
                method: 'GET', 
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json', 
                }, 
            }); 
 
            if (!response.ok) { 
                const errorData = await response.json(); 
                throw new Error(errorData.message || 'Failed to fetch posts.'); 
            } 
 
            const data = await response.json(); 
            setPosts(data); 
 
        } catch (err) { 
            setError(`Error fetching data: ${err.message}`); 
             
        } finally { 
            setLoading(false); 
        } 
    }; 
 
    useEffect(() => { 
        fetchPosts(); 
    }, []); 
 
    // --- Placeholder Delete Handler --- 
    const handleDelete = async (postId) => { 
        // NOTE: The backend DELETE route (e.g., /api/blog/:id) still needs to be fully implemented  
        // with the protect and admin middleware. 
 
        if (!window.confirm(`Are you sure you want to delete post ID: ${postId}?`)) { 
            return; 
        } 
         
        const token = getToken(); 
        if (!token) return; 
 
        try { 
            const response = await fetch(`${API_BASE}/${postId}`, { 
                method: 'DELETE', 
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                }, 
            }); 
 
            if (response.ok) { 
                alert("Post deleted successfully (assuming backend route works)"); 
                // Refresh the list after successful deletion 
                fetchPosts();  
            } else { 
                 const errorData = await response.json(); 
                 alert(`Deletion failed: ${errorData.message}`); 
            } 
 
        } catch (err) { 
            alert(`Network error during deletion: ${err.message}`); 
        } 
    }; 
     
    // --- Render Logic --- 
    if (loading) return <div className="container mt-5 text-center">Loading Admin 
Posts...</div>; 
    if (error) return <div className="container mt-5 alert alert-danger">Error: {error}</div>; 
 
    return ( 
        <div className="container mt-5"> 
            <h1 className="mb-4">Admin Post List</h1> 
 
            <p className="text-info"> 
                This table lists all posts, enabling management. **Edit and Delete functionality 
requires the backend routes to be implemented/secured.** 
            </p> 
 
            <div className="d-flex justify-content-end mb-3"> 
                <Link to="/admin/post/create" className="btn btn-success"> 
                    + Create New Post 
                </Link> 
            </div> 
 
            <div className="table-responsive"> 
                <table className="table table-striped table-bordered"> 
                    <thead className="table-dark"> 
                        <tr> 
                            <th>ID</th> 
                            <th>Title</th> 
                            <th>Author</th> 
                            <th>Created At</th> 
                            <th>Actions</th> 
                        </tr> 
                    </thead> 
                    <tbody> 
                        {posts.length > 0 ? ( 
                            posts.map((post) => ( 
                                <tr key={post._id}> 
                                    <td>{post._id.substring(0, 8)}...</td> 
                                    <td>{post.title}</td> 
                                    <td>{post.author}</td> 
                                    <td>{new Date(post.createdAt).toLocaleDateString()}</td> 
                                    <td> 
                                        <Link  
                                            to={`/admin/post/edit/${post._id}`}  
                                            className="btn btn-sm btn-primary me-2" 
                                            // NOTE: The Edit component route needs to be added to App.js 
                                        > 
                                            Edit 
                                        </Link> 
                                        <button  
                                            className="btn btn-sm btn-danger"  
                                            onClick={() => handleDelete(post._id)} 
                                        > 
                                            Delete 
                                        </button> 
                                    </td> 
                                </tr> 
                            )) 
                        ) : ( 
                            <tr> 
                                <td colSpan="5" className="text-center">No posts found.</td> 
                            </tr> 
                        )} 
                    </tbody> 
                </table> 
            </div> 
        </div> 
    ); 
} 

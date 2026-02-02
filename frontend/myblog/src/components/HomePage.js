import React, { useState, useEffect } from "react"; 
import { Link } from "react-router-dom"; 
 
// *** API URL confirmed to match backend prefix /api/blog *** 
const API_POSTS_URL = "http://localhost:5000/api/blog";  
 
// --- Post Card Component (Helper for rendering individual posts) --- 
const PostCard = ({ post }) => { 
    // Safety check in case the post object is null or undefined 
    if (!post) return null;  
     
    return ( 
        <div className="col-lg-4 col-md-6 mb-4"> 
            <div className="card h-100 shadow-sm"> 
                <div className="card-body d-flex flex-column"> 
                    <h5 className="card-title text-primary">{post.title || 'Untitled Post'}</h5> 
                    <p className="card-text text-muted small mb-3"> 
                        Published: {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 
'N/A'} 
                    </p> 
                    <p className="card-text flex-grow-1"> 
                        {/* Robust check for content before substring */} 
                        {post.content ? post.content.substring(0, 100) + '...' : 'No content preview available.'} 
                    </p> 
                    <div className="mt-auto"> 
                        {/* Link to view the full single post, ensures _id exists */} 
                        {post._id && ( 
                            <Link to={`/posts/${post._id}`} className="btn btn-outline-primary btn
sm"> 
                                View Post 
                            </Link> 
                        )} 
                    </div> 
                </div> 
            </div> 
        </div> 
    ); 
}; 
 
// --- HomePage Component --- 
export default function HomePage() { 
    const [posts, setPosts] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 
 
    useEffect(() => { 
        const fetchPosts = async () => { 
            setLoading(true); 
            setError(null); 
            try { 
                const token = sessionStorage.getItem('token'); 
                 
                const headers = { 'Content-Type': 'application/json' }; 
                 
                // CRITICAL: Conditionally add Authorization header 
                if (token) { 
                    headers.Authorization = `Bearer ${token}`; 
                } 
 
                const response = await fetch(API_POSTS_URL, { 
                    method: 'GET', 
                    headers: headers,  
                }); 
 
                if (response.status === 401 || response.status === 403) { 
                    throw new Error("Authentication failed. Please re-login to view posts."); 
                } 
 
                if (!response.ok) { 
                    throw new Error(`Failed to fetch blog posts from the server. (Status: ${response.status})`); 
                } 
 
                const data = await response.json(); 
                 
                // Ensure the result is an array, handling various API response formats 
                const postsArray = Array.isArray(data) ? data : (data.posts || data.data || []); 
                setPosts(postsArray); 
                 
            } catch (err) { 
                console.error("Fetch error:", err); 
                setError(err.message || "Could not connect to the post server. Check backend URL."); 
            } finally { 
                setLoading(false); 
            } 
        }; 
 
        fetchPosts(); 
    }, []);  
 
     
    // --- Rendering Logic --- 
 
    return ( 
        <div className="container mt-5"> 
            <h1 className="display-5 fw-bold text-center mb-4">Available Blog Posts</h1> 
            <p className="lead text-center text-muted mb-5"> 
                Browse our latest insights and stories. 
            </p> 
 
            <div className="row"> 
                {/* 1. Loading State */} 
                {loading && ( 
                    <div className="text-center mt-5 col-12"> 
                        <div className="spinner-border text-primary" role="status"> 
                            <span className="visually-hidden">Loading...</span> 
                        </div> 
                        <p className="mt-3">Loading posts...</p> 
                    </div> 
                )} 
 
                {/* 2. Error State */} 
                {error && ( 
                    <div className="alert alert-danger text-center col-12" role="alert"> 
                        Error fetching posts: {error} 
                    </div> 
                )} 
                 
                {/* 3. Empty State */} 
                {!loading && !error && posts.length === 0 && ( 
                    <div className="alert alert-info text-center mt-5 col-12"> 
                        No blog posts available right now. Check back soon! 
                    </div> 
                )} 
 
                {/* 4. Display Posts (Loop is confirmed correct) */} 
                {!loading && !error && posts.length > 0 && ( 
                    posts.map(post => ( 
                        <PostCard key={post._id} post={post} /> 
                    )) 
                )} 
            </div> 
             
        </div> 
    ); 
} 
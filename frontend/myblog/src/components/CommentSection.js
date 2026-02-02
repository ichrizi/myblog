import React, { useState, useEffect, useCallback } from 'react'; 
import './commentSection.css'; // Add this import 
 
const API_COMMENT_URL = 'http://localhost:5000/api/comments'; 
const API_FETCH_COMMENTS_URL = 'http://localhost:5000/api/comments'; 
 
// Helper function: format time elapsed 
const formatTimeElapsed = (dateString) => { 
    const now = new Date(); 
    const past = new Date(dateString); 
    const diffInSeconds = Math.floor((now - past) / 1000); 
 
    if (diffInSeconds < 60) return `${diffInSeconds}s`; 
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`; 
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`; 
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`; 
 
    return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); 
}; 
 
export default function CommentSection({ postId, currentUser }) { 
 
    const [comments, setComments] = useState([]); 
    const [newComment, setNewComment] = useState(''); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const [submitting, setSubmitting] = useState(false); 
 
    // Load comments 
    const fetchComments = useCallback(async () => { 
        if (!postId) return; 
 
        setLoading(true); 
        setError(null); 
 
        try { 
            const response = await fetch(`${API_FETCH_COMMENTS_URL}/${postId}`); 
            if (!response.ok) throw new Error('Failed to load comments.'); 
 
            const data = await response.json(); 
            setComments(data); 
        } catch (err) { 
            console.error("Error fetching comments:", err); 
            setError("Failed to load comments."); 
        } finally { 
            setLoading(false); 
        } 
    }, [postId]); 
 
    useEffect(() => { 
        fetchComments(); 
    }, [fetchComments]); 
 
    // Submit new comment 
    const handleSubmit = async (e) => { 
        e.preventDefault(); 
        if (!newComment.trim() || !postId || submitting || !currentUser) return; 
 
        setSubmitting(true); 
        setError(null); 
 
        try { 
            const token = sessionStorage.getItem('token'); 
            if (!token) throw new Error("Authentication token missing. Please log in again."); 
 
            const response = await fetch(API_COMMENT_URL, { 
                method: 'POST', 
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`, 
                }, 
                body: JSON.stringify({ 
                    postId, 
                    content: newComment.trim(), 
                    author: currentUser.username || currentUser.email || 'System User' 
                }), 
            }); 
 
            if (!response.ok) { 
                const errorData = await response.json(); 
                throw new Error(errorData.message || 'Failed to post comment.'); 
            } 
 
            setNewComment(''); 
            await fetchComments(); 
 
        } catch (err) { 
            setError(err.message); 
            console.error('Comment submission error:', err); 
        } finally { 
            setSubmitting(false); 
        } 
    }; 
 
    return ( 
        <section className="mt-5"> 
            <h3 className="mb-4">Comments</h3> 
 
            {/* Comment Form */} 
            {currentUser ? ( 
                <div className="card shadow-sm mb-5"> 
                    <div className="card-body"> 
                        <form onSubmit={handleSubmit}> 
                            <textarea 
                                className="form-control mb-3" 
                                rows="3" 
                                placeholder="Join the discussion and leave a comment!" 
                                value={newComment} 
                                onChange={(e) => setNewComment(e.target.value)} 
                                disabled={submitting} 
                                required 
                            ></textarea> 
 
                            {error && <div className="text-danger mb-2">{error}</div>} 
 
                            <button  
                                type="submit"  
                                className="btn btn-primary" 
                                disabled={submitting} 
                            > 
                                {submitting ? 'Posting...' : 'Submit Comment'} 
                            </button> 
                        </form> 
                    </div> 
                </div> 
            ) : ( 
                <div className="alert alert-info mb-5"> 
                    Please log in to leave a comment. 
                </div> 
            )} 
 
            {/* Comments */} 
            {loading && <p>Loading comments...</p>} 
            {!loading && comments.length === 0 && <p>No comments yet. Be the first!</p>} 
 
            {!loading && comments.map((comment) => ( 
                <div className="comment-item d-flex mb-4" key={comment._id}> 
 
                    {/* Avatar */} 
                    <div className="comment-avatar"> 
                        <div className="avatar-circle">    </div> 
                    </div> 
 
                    {/* Comment Body */} 
                    <div className="comment-body"> 
 
                        {/* Username + Comment */} 
                        <div className="comment-box"> 
                            <span className="comment-username">{comment.author}</span> 
                            <span className="comment-text">{comment.content}</span> 
                        </div> 
 
                        {/* Time + React + Reply */} 
                        <div className="comment-meta"> 
                            {comment.createdAt && ( 
                                <span className="comment-time"> 
                                    {formatTimeElapsed(comment.createdAt)} 
                                </span> 
                            )} 
                            <span className="comment-action">React</span> 
                            <span className="comment-action">Reply</span> 
                        </div> 
 
                    </div> 
                </div> 
            ))} 
        </section> 
    ); 
}
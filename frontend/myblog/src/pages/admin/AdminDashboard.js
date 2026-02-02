import React, { useState, useEffect } from 'react'; 
 
// Helper to get stored token 
function getToken() { 
    return sessionStorage.getItem("token"); 
} 
 
const API_BASE = 'http://localhost:5000/api/'; 
 
const fetchData = async (endpoint) => { 
    const token = getToken(); 
    if (!token) return []; 
 
    try { 
        const response = await fetch(API_BASE + endpoint, { 
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json', 
            }, 
        }); 
         
        if (response.ok) { 
            return await response.json(); 
        } else { 
            // Handle 401/403 errors gracefully 
            const errorData = await response.json(); 
            console.error(`Failed to fetch ${endpoint}:`, errorData.message); 
            return []; 
        } 
    } catch (err) { 
        console.error(`Network error fetching ${endpoint}:`, err); 
        return []; 
    } 
}; 
 
const renderTable = (data, title, columns) => ( 
    <div className="mb-5"> 
        <h2>{title} ({data.length}) (INSECURE TEST MODE)</h2> 
        <div className="table-responsive"> 
            <table className="table table-striped table-bordered table-sm"> 
                <thead className="table-dark"> 
                    <tr> 
                        {columns.map(col => <th key={col.key}>{col.label}</th>)} 
                    </tr> 
                </thead> 
                <tbody> 
                    {data.map(item => ( 
                        <tr key={item._id}> 
                            {columns.map(col => ( 
                                <td key={col.key}> 
                                    {col.truncate ? ( 
                                        item[col.key] && item[col.key].length > col.truncate ?  
                                            item[col.key].substring(0, col.truncate) + '...' :  
                                            item[col.key] 
                                    ) : ( 
                                        item[col.key] 
                                    )} 
                                </td> 
                            ))} 
                        </tr> 
                    ))} 
                    {data.length === 0 && <tr><td colSpan={columns.length} className="text
center">No data available.</td></tr>} 
                </tbody> 
            </table> 
        </div> 
    </div> 
); 
 
export default function AdminDashboard() { 
    const [users, setUsers] = useState([]); 
    const [posts, setPosts] = useState([]); 
    const [comments, setComments] = useState([]); 
    const [loading, setLoading] = useState(true); 
 
    useEffect(() => { 
        setLoading(true); 
        const fetchAllData = async () => { 
            const [usersData, postsData, commentsData] = await Promise.all([ 
                fetchData('users'), // NEW API call for all users 
                fetchData('blog'), // Existing API call for all posts 
                fetchData('comments'), // NEW API call for all comments 
            ]); 
 
            setUsers(usersData); 
            setPosts(postsData); 
            setComments(commentsData); 
            setLoading(false); 
        }; 
 
        fetchAllData(); 
    }, []); 
 
    if (loading) return <div className="container mt-5">Loading Dashboard Data...</div>; 
 
    // Define table columns explicitly for security testing visibility 
    const userColumns = [ 
        { key: '_id', label: 'ID', truncate: 8 }, 
        { key: 'username', label: 'Username' }, 
        { key: 'email', label: 'Email' }, 
        { key: 'password', label: 'Password (PLAINTEXT)' }, // INSECURE: Visible for testing 
        { key: 'role', label: 'Role' }, 
    ]; 
 
    const postColumns = [ 
        { key: '_id', label: 'ID', truncate: 8 }, 
        { key: 'title', label: 'Title', truncate: 50 }, 
        { key: 'author', label: 'Author' }, 
        { key: 'content', label: 'Content (SQLi Field)', truncate: 40 }, // Highlighting injection point 
        { key: 'createdAt', label: 'Created', truncate: 10 }, 
    ]; 
 
    const commentColumns = [ 
        { key: '_id', label: 'ID', truncate: 8 }, 
        { key: 'postId', label: 'Post ID', truncate: 8 }, 
        { key: 'user', label: 'Commenter' }, 
        { key: 'text', label: 'Comment Text (XSS Field)', truncate: 50 }, // Highlighting injection point 
    ]; 
 
    return ( 
        <div className="container mt-5"> 
            <h1>Admin Dashboard Overview</h1> 
            <p className="text-danger fw-bold">Warning: This dashboard displays sensitive 
and insecure data (e.g., plaintext passwords, XSS/SQLi fields) and should only be used for 
penetration testing.</p> 
 
            <hr /> 
 
            {/* Users Table */} 
            {renderTable(users, 'All Users', userColumns)} 
 
            {/* Blog Posts Table */} 
            {renderTable(posts, 'All Blog Posts', postColumns)} 
 
            {/* Comments Table */} 
            {renderTable(comments, 'All Comments', commentColumns)} 
        </div> 
    ); 
}
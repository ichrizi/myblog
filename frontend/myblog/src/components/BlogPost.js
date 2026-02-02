// BlogPost.js 
import { useParams } from "react-router-dom"; 
import { useEffect, useState } from "react"; 
 
export default function BlogPost() { 
  const { id } = useParams(); 
  const [post, setPost] = useState(null); 
  const [comments, setComments] = useState([]); 
  const [text, setText] = useState(""); 
 
  useEffect(() => { 
    //    NOTE: Post fetching URL is likely incorrect too. Assuming /api/blog is correct for your routes 
    // Correct URL for fetching a single post from blogRoutes.js 
    fetch(`http://localhost:5000/api/blog/${id}`)  
      .then(res => res.json()) 
      .then(data => setPost(data)); 
 
    //    FIX: Updated URL to use the new /api/comments endpoint 
    fetch(`http://localhost:5000/api/comments/${id}`)  
      .then(res => res.json()) 
      .then(data => setComments(data)); 
  }, [id]); 
 
  function addComment() { 
    //    FIX: Updated URL to use the new /api/comments endpoint 
    fetch("http://localhost:5000/api/comments", {  
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ 
        postId: id, 
        user: "testUser", // TEMPORARY no authentication for testing 
        text: text 
      }) 
    }) 
      .then(res => res.json()) 
      .then(() => { 
        // Fetch comments again instead of a full page reload for better user experience 
        fetch(`http://localhost:5000/api/comments/${id}`)  
          .then(res => res.json()) 
          .then(data => setComments(data)); 
        setText(""); // Clear the input field 
      }) 
      .catch(err => console.error("Error posting comment:", err)); 
  } 
 
  if (!post) return <p>Loading...</p>; 
 
  return ( 
    <div className="container mt-4"> 
      <h2>{post.title}</h2> 
      <p>{post.content}</p> 
 
      <hr /> 
 
      <h4>Comments</h4> 
      <ul className="list-group mb-3"> 
        {comments.map((c, index) => ( 
          <li key={c._id || index} className="list-group-item"> {/* Use c._id for key if available */} 
            <strong>{c.user}:</strong> {c.text} 
          </li> 
        ))} 
      </ul> 
 
      <textarea 
        className="form-control" 
        placeholder="Write a comment..." 
        value={text} // Bind value for controlled component 
        onChange={(e) => setText(e.target.value)} 
      ></textarea> 
 
      <button className="btn btn-primary mt-2" onClick={addComment} 
disabled={!text.trim()}> 
        Post Comment 
      </button> 
    </div> 
  ); 
} 
 
Contact.js 
export default function Contact() { 
  return ( 
    <div className="container mt-4"> 
      <h2>Contact Me</h2> 
      <p>You can reach me at:</p> 
 
      <ul> 
        <li>Email: example@myblog.com</li> 
        <li>Facebook: @myblogpage</li> 
        <li>Github: github.com/myblog</li> 
      </ul> 
    </div> 
  ); 
} 

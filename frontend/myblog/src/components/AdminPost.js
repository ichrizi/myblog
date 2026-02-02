export default function AdminPost() { 
  const user = JSON.parse(sessionStorage.getItem("user")); 
 
  if (!user || user.role !== "admin") { 
    return ( 
      <div className="container mt-4"> 
        <h2>Access Denied</h2> 
        <p>Administrators only.</p> 
      </div> 
    ); 
  } 
 
  return ( 
    <div className="container mt-4"> 
      <h2>Manage Posts</h2> 
      <p>Future admin tools to edit/delete posts.</p> 
    </div> 
  ); 
} 
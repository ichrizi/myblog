import { useState } from "react"; 
import { Link } from "react-router-dom"; 
import LogoutModal from "./LogoutModal.js"; 
 
export default function AppNavbar({ currentUser, setCurrentUser }) { 
  const [showLogout, setShowLogout] = useState(false); 
 
  // Logout handler 
  const handleLogout = () => { 
    sessionStorage.removeItem("user"); // remove session 
    setCurrentUser(null); // update navbar immediately 
    setShowLogout(false); // close modal 
  }; 
 
  return ( 
    <> 
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark"> 
        <div className="container-fluid"> 
          <Link className="navbar-brand" to="/">My Blog</Link> 
 
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#mainNavbar" 
            aria-controls="mainNavbar" 
            aria-expanded="false" 
            aria-label="Toggle navigation" 
          > 
            <span className="navbar-toggler-icon"></span> 
          </button> 
 
          <div className="collapse navbar-collapse" id="mainNavbar"> 
            <ul className="navbar-nav ms-auto"> 
              {/* Guest Links */} 
              {!currentUser && ( 
                <> 
                  <li className="nav-item"><Link className="nav-link" 
to="/about">About</Link></li> 
                  <li className="nav-item"><Link className="nav-link" 
to="/services">Services</Link></li> 
                  <li className="nav-item"><Link className="nav-link" 
to="/contact">Contact</Link></li> 
                  <li className="nav-item"><Link className="nav-link" 
to="/login">Login</Link></li> 
                  <li className="nav-item"><Link className="nav-link" 
to="/register">Register</Link></li> 
                </> 
              )} 
 
              {/* Regular User Links */} 
              {currentUser?.role === "user" && ( 
                <> 
                  <li className="nav-item"><Link className="nav-link" 
to="/home">Home</Link></li> 
                  <li className="nav-item"> 
                    <button className="nav-link btn btn-link" onClick={() => 
setShowLogout(true)}>Logout</button> 
                  </li> 
                </> 
              )} 
 
              {/* Admin Links */} 
              {currentUser?.role === "admin" && ( 
                <> 
                  <li className="nav-item"><Link className="nav-link" 
to="/dashboard">Dashboard</Link></li> 
                  <li className="nav-item"><Link className="nav-link" 
to="/admin/post">Manage Posts</Link></li> 
                  <li className="nav-item"> 
                    <button className="nav-link btn btn-link" onClick={() => 
setShowLogout(true)}>Logout</button> 
                  </li> 
                </> 
              )} 
            </ul> 
          </div> 
        </div> 
      </nav> 
 
      {/* Logout Confirmation Modal */} 
      <LogoutModal 
        show={showLogout} 
        onClose={() => setShowLogout(false)} 
        onConfirm={handleLogout} 
      /> 
    </> 
  ); 
} 
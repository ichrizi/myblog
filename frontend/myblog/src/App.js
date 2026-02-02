import React, { useState, useEffect } from "react"; 
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; 
// --- Imports --- 
import AppNavbar from "./components/AppNavbar.js"; 
import Login from "./components/Login.js";        
import Register from "./components/Register.js";    
import About from "./components/About.js";          
import Services from "./components/Services.js";    
import Contact from "./components/Contact.js";      
import HomePage from "./components/HomePage.js";  
import Dashboard from "./components/Dashboard.js";  
import SinglePostView from "./components/SinglePostView.js"; // <-- NEW: Import SinglePostView 
// --- ADMIN COMPONENTS --- 
import AdminDashboard from "./pages/admin/AdminDashboard.js"; 
import AdminPostList from "./pages/admin/AdminPostList.js"; 
import CreatePostPage from "./pages/admin/CreatePostPage.js";  
import AdminPostEdit from "./pages/admin/AdminPostEdit.js";  
// === User Access Control Wrapper === 
const UserWrapper = ({ currentUser, children }) => { 
if (!currentUser) { 
return <Navigate to="/login" replace />;  
} 
// Standard user can access content 
return children; 
}; 
// === Admin Access Control Wrapper (Remains the same) === 
const AdminWrapper = ({ currentUser, children }) => { 
if (!currentUser) { 
return <Navigate to="/login" replace />;  
    } 
    if (currentUser.role !== 'admin') { 
        return <h1 className="container mt-5 text-danger">403 Forbidden: Admin Access 
Required</h1>;  
    } 
    return children; 
}; 
 
export default function App() { 
    const [currentUser, setCurrentUser] = useState(null);  
 
    useEffect(() => { 
        const user = sessionStorage.getItem("user"); 
        if (user) { 
            // If user data is found, parse it and set it as the current user state 
            setCurrentUser(JSON.parse(user)); 
        } 
    }, []); 
 
    return ( 
        <Router> 
            <AppNavbar currentUser={currentUser} setCurrentUser={setCurrentUser} /> 
 
            <Routes> 
                {/* 1. ENTRY/PUBLIC ROUTES */} 
                 
                {/* ROOT PATH REDIRECT */} 
                <Route  
                    path="/"  
                    element={currentUser ? <Navigate to="/home" replace /> : <Navigate to="/login" 
replace />}  
                /> 
 
                {/* LOGIN and REGISTER */} 
                <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} /> 
                <Route path="/register" element={<Register setCurrentUser={setCurrentUser} />} 
/>  
                 
                {/* 2. AUTHENTICATED USER ROUTES */} 
 
                <Route  
                    path="/home"  
                    element={ 
                        <UserWrapper currentUser={currentUser}> 
                            <HomePage />  
                        </UserWrapper> 
                    }  
                /> 
                 
                {/* FIX APPLIED HERE: Dynamic Route for Single Blog Post View */} 
                <Route  
                    path="/posts/:id"  
                    element={ 
                        <UserWrapper currentUser={currentUser}> 
                            {/* PASSING THE PROP DOWN: essential for comment functionality */} 
                            <SinglePostView currentUser={currentUser} />  
                        </UserWrapper> 
                    }  
                /> 
                 
                {/* Wrapping all other user routes in UserWrapper */} 
                <Route path="/about" element={<UserWrapper currentUser={currentUser}><About 
/></UserWrapper>} />  
                <Route path="/services" element={<UserWrapper 
currentUser={currentUser}><Services /></UserWrapper>} />  
                <Route path="/contact" element={<UserWrapper 
currentUser={currentUser}><Contact /></UserWrapper>} />  
                <Route path="/user-dashboard" element={<UserWrapper 
currentUser={currentUser}><Dashboard /></UserWrapper>} />  
                 
                {/* 3. PROTECTED ADMIN ROUTES */} 
                 
                <Route  
                    path="/dashboard"  
                    element={ 
                        <AdminWrapper currentUser={currentUser}> 
                            <AdminDashboard /> 
                        </AdminWrapper> 
                    }  
                /> 
                <Route  
                    path="/admin/posts/list"  
                    element={ 
                        <AdminWrapper currentUser={currentUser}> 
                            <AdminPostList /> 
                        </AdminWrapper> 
                    }  
                /> 
                <Route  
                    path="/admin/post/create"  
                    element={ 
                        <AdminWrapper currentUser={currentUser}> 
                            <CreatePostPage />  
                        </AdminWrapper> 
                    }  
                /> 
                <Route  
                    path="/admin/post/edit/:id"  
                    element={ 
                        <AdminWrapper currentUser={currentUser}> 
                            <AdminPostEdit />  
                        </AdminWrapper> 
                    }  
                /> 
 
                {/* 4. Catch-all Route */} 
                <Route path="*" element={<h1 className="container mt-5">404 Page Not 
Found</h1>} /> 
            </Routes> 
        </Router> 
    ); 
}
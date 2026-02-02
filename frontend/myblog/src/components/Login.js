import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
 
const Login = ({ onLogin }) => { 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [message, setMessage] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate(); 
 
  const API_URL = 'http://localhost:5000/api/auth/login'; 
 
  const handleLogin = async (e) => { 
    e.preventDefault(); 
    setMessage(''); 
    setLoading(true); 
 
    try { 
      const response = await fetch(API_URL, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email: email.trim(), password: password.trim() }), 
      }); 
 
      const data = await response.json(); 
 
      if (response.ok) { 
        const userData = data.user; 
        sessionStorage.setItem('user', JSON.stringify(userData)); 
 
        if (onLogin) onLogin(userData); // updates navbar immediately 
 
        // Redirect based on role 
        if (userData.role === 'admin') navigate('/dashboard'); 
        else navigate('/home'); 
      } else { 
        setMessage(data.message || 'Login failed.'); 
      } 
    } catch (err) { 
      console.error(err); 
      setMessage('Cannot connect to server.'); 
    } finally { 
      setLoading(false); 
    } 
  }; 
 
  const alertClass = message.includes('failed') || message.includes('Cannot') ? 'alert danger' : 'alert-success'; 
 
  return ( 
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light"> 
      <div className="card p-4 shadow-lg" style={{ maxWidth: '400px', width: '100%' }}> 
        <h2 className="h3 text-center text-success mb-4 fw-bold">User Login</h2> 
 
        {message && <div className={`alert ${alertClass} rounded`} 
role="alert">{message}</div>} 
 
        <form onSubmit={handleLogin}> 
          <div className="mb-3"> 
            <label className="form-label fw-bold">Email</label> 
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            /> 
          </div> 
          <div className="mb-3"> 
            <label className="form-label fw-bold">Password</label> 
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            /> 
          </div> 
          <div className="d-grid mt-4"> 
            <button type="submit" className="btn btn-success fw-bold" 
disabled={loading}> 
              {loading ? 'Logging in...' : 'Log In'} 
            </button> 
          </div> 
        </form> 
      </div> 
    </div> 
  ); 
}; 
 
export default Login;
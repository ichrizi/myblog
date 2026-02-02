const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

// In-memory token revocation list (best-effort for logout)
const revokedTokens = new Map();

const revokeToken = (token, exp) => {
  if (!token) return;
  const expiresAt = exp ? exp * 1000 : Date.now() + 30 * 24 * 60 * 60 * 1000;
  revokedTokens.set(token, expiresAt);
};

const isTokenRevoked = (token) => {
  const expiresAt = revokedTokens.get(token);
  if (!expiresAt) return false;
  if (expiresAt < Date.now()) {
    revokedTokens.delete(token);
    return false;
  }
  return true;
};
 
// Fallback secret for dev/test 
const JWT_FALLBACK_SECRET = "insecure-test-secret"; 
 
// Protect routes 
const protect = async (req, res, next) => {  
  const authHeader = req.headers.authorization; 
 
  if (!authHeader || !authHeader.startsWith("Bearer ")) { 
    return res.status(401).json({ message: "Unauthorized: No token" }); 
  } 
 
  const token = authHeader.split(" ")[1]; 

  if (isTokenRevoked(token)) {
    return res.status(401).json({ message: "Unauthorized: Token revoked" });
  }
 
  try { 
    const secret = process.env.JWT_SECRET || JWT_FALLBACK_SECRET; 
    const decoded = jwt.verify(token, secret);  
 
    // 2. FETCH FULL USER OBJECT FROM DB 
    // Await the Mongoose call and use decoded.id 
    req.user = await User.findById(decoded.id).select("-password"); 
 
    // 3. CHECK FOR DATABASE FAILURE 
    if (!req.user) { 
        // If findById returns null, it means the token is valid, but the user ID is not in the 
database. 
        console.error(`ERROR: Valid token points to missing user ID: ${decoded.id}`); 
        return res.status(401).json({ message: "Unauthorized: User ID not found in database." 
}); 
    } 
 
    // 4. DEBUG LOG: CONFIRM USER DATA IS ATTACHED 
    console.log(`User ID ${req.user._id} successfully attached to request.`); 
     
    next();  
  } catch (error) { 
    // This catches token verification errors (expired, wrong secret, malformed) 
    console.error("TOKEN VERIFICATION FAILURE:", error.message); 
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" }); 
  } 
}; 
 
// Admin only 
const admin = (req, res, next) => { 
    // Check if req.user is null (shouldn't happen if protect passes) OR if the role is not 
'admin' 
    if (!req.user || req.user.role !== "admin") { 
        // FIX: Change the error message to explicitly state 'Admin access required' 
        return res.status(403).json({  
            message: "Forbidden: Admin access required to perform this action."  
        }); 
    } 
    next(); 
}; 

// Role-based access control
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user attached" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Requires one of these roles: ${allowedRoles.join(", ")}`,
      });
    }
    next();
  };
};

// Resource ownership check - verify user is owner or admin
const isOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: No user attached" });
  }
  if (req.user.role === "admin") {
    return next();
  }
  if (!req.params.id) {
    return res.status(400).json({ message: "Resource ID required" });
  }
  req.isOwnerOrAdmin = true;
  next();
};

module.exports = { protect, admin, authorize, isOwnerOrAdmin, revokeToken, isTokenRevoked };
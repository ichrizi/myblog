const User = require("../models/userModel.js"); 
const jwt = require("jsonwebtoken"); 
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const logger = require("../utils/logger.js");
const { revokeToken } = require("../middeware/authMiddleware.js");
const { encrypt, decrypt } = require("../utils/encryption.js");
 
// Fallback secret for dev/test 
const JWT_FALLBACK_SECRET = "insecure-test-secret"; 
 
// Generate access token (short-lived)
const generateAccessToken = (id, role) => { 
  const secret = process.env.JWT_SECRET || JWT_FALLBACK_SECRET; 
  return jwt.sign({ id, role }, secret, { expiresIn: "15m" }); 
}; 

// Generate refresh token (long-lived, stored hashed)
const generateRefreshToken = () => crypto.randomBytes(48).toString("hex");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
 
// REGISTER 
const register = async (req, res) => { 
  try { 
    const { username, email, password, role } = req.body; 
    
    // Validation
    if (!username || !email || !password) { 
      logger.warn("Auth register failed: missing fields");
      return res.status(400).json({ success: false, message: "All fields are required" }); 
    }

    // Length validation
    if (username.trim().length < 3 || username.trim().length > 50) {
      logger.warn("Auth register failed: username length");
      return res.status(400).json({ success: false, message: "Username must be 3-50 characters" });
    }

    if (password.length < 6 || password.length > 128) {
      logger.warn("Auth register failed: password length");
      return res.status(400).json({ success: false, message: "Password must be 6-128 characters" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      logger.warn("Auth register failed: invalid email format");
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }
 
    const exists = await User.findOne({ email: normalizedEmail }); 
    if (exists) {
      logger.warn("Auth register failed: email already registered", { email: normalizedEmail });
      return res.status(409).json({ success: false, message: "Email already registered" }); 
    }
 
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ 
      username: username.trim(), 
      email: encrypt(normalizedEmail), 
      password: hashedPassword, 
      role: role || "user",
    }); 
 
    await newUser.save(); 
 
    const accessToken = generateAccessToken(newUser._id, newUser.role);
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashToken(refreshToken);
    const refreshTokenExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    newUser.refreshTokenHash = refreshTokenHash;
    newUser.refreshTokenExp = refreshTokenExp;
    await newUser.save();
 
    logger.info(`Auth register success: user created`, { userId: newUser._id, username: newUser.username, role: newUser.role });
    return res.status(201).json({ 
      success: true,
      message: `User registered successfully as ${newUser.role}`, 
      accessToken,
      refreshToken,
      user: { 
        id: newUser._id, 
        username: newUser.username, 
        email: normalizedEmail,
        role: newUser.role, 
      }, 
    }); 
  } catch (err) { 
    logger.error("Auth register error", err, { email: req.body.email });
    return res.status(500).json({ success: false, error: "Registration failed", details: err.message }); 
  } 
};
 
// LOGIN 
const login = async (req, res) => { 
  try {
    console.log('DEBUG: Login route called');
    const { email, password } = req.body; 
    console.log('DEBUG: Email and password extracted');
    if (!email || !password) 
      return res.status(400).json({ success: false, message: "Email and password required" }); 
 
    const normalizedEmail = email.trim().toLowerCase(); 
    console.log('DEBUG: Email normalized:', normalizedEmail);
    const user = await User.findOne(); 
    
    // Since email is encrypted, we need to fetch all users and compare
    const allUsers = await User.find({});
    let matchedUser = null;
    for (let u of allUsers) {
      try {
        const decryptedEmail = decrypt(u.email);
        if (decryptedEmail === normalizedEmail) {
          matchedUser = u;
          break;
        }
      } catch (err) {
        continue;
      }
    }
    
    if (!matchedUser) { 
      logger.warn("Auth login failed: user not found", { email: normalizedEmail });
      return res.status(401).json({ success: false, message: "Invalid email or password" }); 
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, matchedUser.password);
    if (!isMatch) {
      logger.warn("Auth login failed: password mismatch", { userId: matchedUser._id });
      return res.status(401).json({ success: false, message: "Invalid email or password" }); 
    } 
 
    const accessToken = generateAccessToken(matchedUser._id, matchedUser.role);
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashToken(refreshToken);
    const refreshTokenExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    matchedUser.refreshTokenHash = refreshTokenHash;
    matchedUser.refreshTokenExp = refreshTokenExp;
    await matchedUser.save();
 
    logger.info(`Auth login success`, { userId: matchedUser._id, username: matchedUser.username });
    return res.status(200).json({ 
      success: true,
      message: "Login successful", 
      accessToken,
      refreshToken,
      user: { 
        id: matchedUser._id, 
        username: matchedUser.username, 
        email: normalizedEmail, 
        role: matchedUser.role, 
      }, 
    }); 
  } catch (err) { 
    logger.error("Auth login error", err);
    return res.status(500).json({ success: false, error: "Login failed", details: err.message }); 
  } 
};;

// REFRESH (rotate refresh token)
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("Auth refresh failed: no token");
      return res.status(400).json({ success: false, message: "Refresh token required" });
    }

    const refreshTokenHash = hashToken(refreshToken);
    const user = await User.findOne({ refreshTokenHash });

    if (!user || !user.refreshTokenExp || user.refreshTokenExp < new Date()) {
      logger.warn("Auth refresh failed: invalid or expired token");
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenHash = hashToken(newRefreshToken);
    const newRefreshTokenExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.refreshTokenHash = newRefreshTokenHash;
    user.refreshTokenExp = newRefreshTokenExp;
    await user.save();

    logger.info("Auth token refresh success", { userId: user._id });
    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    logger.error("Auth refresh error", err);
    return res.status(500).json({ success: false, error: "Refresh failed", details: err.message });
  }
};

// LOGOUT (token revocation + refresh invalidation)
const logout = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("Auth logout failed: no token");
    return res.status(401).json({ success: false, message: "Unauthorized: No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET || JWT_FALLBACK_SECRET;
    const decoded = jwt.verify(token, secret);
    revokeToken(token, decoded.exp);

    await User.findByIdAndUpdate(decoded.id, {
      refreshTokenHash: null,
      refreshTokenExp: null,
    });

    logger.info("Auth logout success", { userId: decoded.id });
    return res.status(200).json({ success: true, message: "Logout successful" });
  } catch (err) {
    logger.warn("Auth logout failed: invalid token", { error: err.message });
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
  }
};

module.exports = { register, login, refresh, logout };
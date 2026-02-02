const crypto = require("crypto");

// Use a key from environment or generate deterministic one
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.scryptSync(process.env.JWT_SECRET || "insecure-secret", "salt", 32);
const ALGORITHM = "aes-256-cbc";

// Encrypt sensitive data
const encrypt = (text) => {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

// Decrypt sensitive data
const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  const parts = encryptedText.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

module.exports = { encrypt, decrypt };

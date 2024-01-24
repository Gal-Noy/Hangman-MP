import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

// Sample middleware for token validation
export const authenticateToken = (req, res, next) => {
  const token = req.header("authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    // Update user activity timestamp
    User.findByIdAndUpdate(decoded.user_id, { lastActive: Date.now() }).exec();

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ msg: "Invalid token." });
  }
};

export const isValidSession = (user, token) => {
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    if (decoded.user_id === user._id) {
      return true;
    }
  } catch (err) {
    return false;
  }
};
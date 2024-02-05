import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import authController from "../controllers/authController.js";

const authRouter = express.Router();

// POST: Signup (create a new user)
authRouter.post("/register", authController.registerUser);

// POST: Login
authRouter.post("/login", authController.loginUser);

// POST: Logout
authRouter.post("/logout", authenticateToken, authController.logoutUser);

// GET: Validate Token
authRouter.get("/validateToken", authenticateToken, (req, res) => {
  // If the token is valid, the user information is available in req.user
  return res.status(200).json({ msg: "Token is valid.", user: req.user });
});

export default authRouter;

import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import usersController from "../controllers/usersController.js";

const usersRouter = express.Router();

// GET: get all users
usersRouter.get("/", usersController.getAllUsers);

// GET: get all users except the current user
usersRouter.get("/list", authenticateToken, usersController.getAllUsersExceptCurrent);

// GET: get a user by id
usersRouter.get("/:id", usersController.getUserById);

// PUT: update a user by id
usersRouter.put("/:id", usersController.updateUserById);

// DELETE: delete a user by id
usersRouter.delete("/:id", usersController.deleteUserById);

export default usersRouter;

import express from "express";
import usersRouter from "./usersRoute.js";
import authRouter from "./authRoute.js";

const router = express.Router();

router.use("/users", usersRouter);
router.use("/auth", authRouter);

export default router;

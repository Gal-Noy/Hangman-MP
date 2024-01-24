import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import handleSocket from "./socket/socketListener.js";
import router from "./routes/index.js";

const server = (app) => {
  dotenv.config({ path: "./config/.env" });

  // Middleware for parsing request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    cors({
      origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
      credentials: true,
    })
  );

  app.use("/api", router);

  handleSocket(app);

  mongoose
    .connect(process.env.DB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));
};

export default server;

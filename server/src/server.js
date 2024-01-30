import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import handleSocket from "./socket/socketListener.js";
import router from "./routes/index.js";
import bodyParser from "body-parser";

const server = (app) => {
  dotenv.config({ path: "./config/.env" });

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb" }));
  
  app.use(cors());

  app.use("/api", router);

  handleSocket(app);

  mongoose
    .connect(process.env.DB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));
};

export default server;

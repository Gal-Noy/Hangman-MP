import express from "express";
import server from "./server.js";

const app = express();

server(app);

app.listen(process.env.PORT, () => {
  console.log("Server is listening on port 3000");
});

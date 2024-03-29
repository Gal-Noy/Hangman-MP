import mongoose from "mongoose";
import { Word } from "../src/models/wordModel.js";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
console.log(process.env.DB_URI);

const init = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    const wordsData = fs.readFileSync("./build/words.json");
    const words = JSON.parse(wordsData);

    await Word.deleteMany();
    await Word.insertMany(words);
    console.log("Words inserted");
  } catch (error) {
    console.log(error);
  } finally {
    mongoose.disconnect();
  }
};

init();

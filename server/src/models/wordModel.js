import mongoose from "mongoose";

const WordSchema = mongoose.Schema({
  word: {
    type: String,
    unique: true,
    required: true,
  },
  definition: {
    type: String,
    required: true,
  },
});

export const Word = mongoose.model("Word", WordSchema);

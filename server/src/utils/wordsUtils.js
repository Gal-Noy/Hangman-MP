import { Word } from "../models/wordModel.js";

const getRandomWord = async () => {
  const count = await Word.countDocuments();
  const random = Math.floor(Math.random() * count);
  const word = await Word.findOne().skip(random);
  return word;
};

export { getRandomWord };

import { Word } from "../models/wordModel.js";

const getRandomWord = async () => {
  const count = await Word.countDocuments();
  const random = Math.floor(Math.random() * count);
  const word = await Word.findOne().skip(random);
  return word;
};

const getKeypadLetters = async (currentWord) => {
  console.log("currentWord", currentWord);
  const uniqueWordLetters = Array.from(new Set(currentWord));
  const additionalLettersNeeded = 12 - uniqueWordLetters.length;
  const additionalLetters = [];
  while (additionalLetters.length < additionalLettersNeeded) {
    const randomLetter = String.fromCharCode(Math.floor(Math.random() * (122 - 97 + 1)) + 97);
    if (!uniqueWordLetters.includes(randomLetter) && !additionalLetters.includes(randomLetter)) {
      additionalLetters.push(randomLetter);
    }
  }
  return uniqueWordLetters.concat(additionalLetters);
};

export { getRandomWord, getKeypadLetters };

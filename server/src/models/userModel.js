import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  inRoom: {
    type: Boolean,
    default: false,
  },
  inGame: {
    type: Boolean,
    default: false,
  },
});

export const User = mongoose.model("User", UserSchema);

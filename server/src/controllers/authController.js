import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authController = {
  registerUser: async (req, res) => {
    try {
      if (!req.body.name || !req.body.email || !req.body.password || !req.body.confirmPassword) {
        return res.status(400).json({ msg: "Please enter all fields" });
      }

      const { name, email, password, confirmPassword } = req.body;

      const existingUser = await User.findOne({
        $or: [{ email: req.body.email.toLowerCase() }, { name: req.body.name.toLowerCase() }],
      }).exec();

      if (existingUser) {
        return res.status(400).json({ msg: "User with same name or email already exists." });
      }

      if (password.length < 6) {
        return res.status(400).json({ msg: "Password must be at least 6 characters long." });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ msg: "Passwords do not match." });
      }

      const encryptedPassword = await bcrypt.hash(password, 10); // Hash the password

      const newUser = {
        name,
        email: email.toLowerCase(),
        password: encryptedPassword,
      };

      const user = await User.create(newUser);

      return res.status(201).json(user);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  loginUser: async (req, res) => {
    try {
      if (!req.body.email || !req.body.password) {
        return res.status(400).json({ msg: "Please enter all fields" });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email }).exec();

      if (user && (await bcrypt.compare(password, user.password))) {
        if (user.isActive) return res.status(400).json({ msg: "User is already logged in." });

        const token = jwt.sign({ user_id: user._id, email }, process.env.TOKEN_KEY, { expiresIn: "1h" });

        await User.findByIdAndUpdate(user._id, { isActive: true });

        return res.status(200).json({
          token,
          user,
          msg: "User logged in successfully.",
        });
      }

      return res.status(400).json({ msg: "Invalid Credentials." });
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  logoutUser: async (req, res) => {
    try {
      const userId = req.user.user_id;

      await User.findByIdAndUpdate(userId, { isActive: false, inRoom: false, inGame: false });

      return res.status(200).json({ msg: "User logged out successfully." });
    } catch (err) {
      return res.status(403).json({ msg: "Invalid token." });
    }
  },
};

export default authController;

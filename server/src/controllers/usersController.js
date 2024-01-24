import { User } from "../models/userModel.js";

const usersController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find({});

      return res.status(200).json(users);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  getAllUsersExceptCurrent: async (req, res) => {
    try {
      const users = await User.find({ _id: { $ne: req.user.user_id } });

      return res.status(200).json(users);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      return res.status(200).json(user);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  updateUserById: async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });

      return res.status(200).json(updatedUser);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },

  deleteUserById: async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);

      return res.status(200).json(deletedUser);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  },
};

export default usersController;

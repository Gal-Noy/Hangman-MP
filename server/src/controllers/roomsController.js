import Room from "../models/roomModel.js";
import { createBoard } from "../utils/boardUtils.js";

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({});
    return res.status(200).json(rooms);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    return res.status(200).json(room);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
};

const createRoom = async (req, res) => {
  try {
    const { players } = req.body;

    const newRoom = new Room({
      name:
        players.length > 1 ? `${players[0].name} and ${players[1].name}'s Arroword` : `${players[0].name}'s Arroword`,
      players: players.map((player) => ({ user: player, score: 0 })),
      board: createBoard(),
      turn: players[Math.floor(Math.random() * items.length)],
    });

    const savedRoom = await Room.create(newRoom);

    return res.status(201).json(savedRoom);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
};

const deleteRoomById = async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);

    return res.status(200).json(deletedRoom);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
};

export { getAllRooms, getRoomById, createRoom, deleteRoomById };

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  clientState: "lobby",
  kickedFromRoom: "",
};

const clientStateSlice = createSlice({
  name: "clientState",
  initialState,
  reducers: {
    setLobby: (state) => {
      state.clientState = "lobby";
      state.roomData = null;
    },
    setRoom: (state, action) => {
      state.clientState = "room";
      state.roomData = action.payload;
    },
    setGame: (state) => {
      state.clientState = "game";
    },
    setGameState: (state, action) => {
      state.gameState = action.payload;
    },
    setKickedFromRoom: (state, action) => {
      state.kickedFromRoom = action.payload;
    },
  },
});

export const { setLobby, setRoom, setGame, setKickedFromRoom, setGameState } = clientStateSlice.actions;
export default clientStateSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  clientState: "lobby",
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
  },
});

export const { setLobby, setRoom, setGame } = clientStateSlice.actions;
export default clientStateSlice.reducer;

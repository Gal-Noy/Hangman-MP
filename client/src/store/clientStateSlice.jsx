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
    },
    setRoom: (state) => {
      state.clientState = "room";
    },
    setGame: (state) => {
      state.clientState = "game";
    },
  },
});

export const { setLobby, setRoom, setGame } = clientStateSlice.actions;
export default clientStateSlice.reducer;

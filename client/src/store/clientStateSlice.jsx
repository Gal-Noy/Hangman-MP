import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  clientState: "lobby",
  lobbyState: "roomsList",
  roomData: null,
  gameState: null,
  kickedFromRoom: "",
};

const clientStateSlice = createSlice({
  name: "clientState",
  initialState,
  reducers: {
    setLobby: (state) => {
      state.clientState = "lobby";
      state.lobbyState = "roomsList";
      state.roomData = null;
      state.gameState = null;
    },
    setLobbyChat: (state) => {
      state.lobbyState = "chat";
    },
    setLobbyRoomsList: (state) => {
      state.lobbyState = "roomsList";
    },
    setRoom: (state, action) => {
      state.clientState = "room";
      state.roomData = action.payload;
      state.gameState = null;
    },
    setReturnToRoom: (state) => {
      state.clientState = "room";
      state.gameState = null;
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

export const {
  setLobby,
  setLobbyChat,
  setLobbyRoomsList,
  setRoom,
  setReturnToRoom,
  setGame,
  setKickedFromRoom,
  setGameState,
} = clientStateSlice.actions;
export default clientStateSlice.reducer;

import { configureStore } from "@reduxjs/toolkit";
import clientStateReducer from "./clientStateSlice";

export default configureStore({
  reducer: {
    clientState: clientStateReducer,
  },
});

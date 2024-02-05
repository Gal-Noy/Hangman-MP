import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/App.css";
import "./styles/pheasant-demure-buttons.css";
import App from "./App.jsx";
import store from "./store/store.jsx";
import { Provider } from "react-redux";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <Provider store={store}>
    <App />
  </Provider>
  // </React.StrictMode>
);

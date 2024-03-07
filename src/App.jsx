import React, { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { WebSocketProvider } from "./WebSocketContext";
import { useDispatch } from "react-redux";
import { setLobby } from "./store/clientStateSlice";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("auth_token") && !!localStorage.getItem("user"));
  const dispatch = useDispatch();
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(import.meta.env.VITE_WS_URL, {
    onOpen: () => {
      console.log("WebSocket connection opened");
      if (isLoggedIn) {
        dispatch(setLobby());
        sendJsonMessage({
          type: "auth",
          content: {
            action: "reAuth",
            data: {
              token: localStorage.getItem("auth_token"),
              user: localStorage.getItem("user"),
            },
          },
        });
      }
    },
    share: false,
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (lastJsonMessage) {
      const { type, content } = lastJsonMessage;
      if (type === "reAuthResponse") {
        const { success, message } = content;
        if (!success) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          dispatch(setLobby());
          alert(message);
          setIsLoggedIn(false); // onLogout()
        }
      }
    }
  }, [lastJsonMessage]);

  return (
    <WebSocketProvider value={{ sendJsonMessage, lastJsonMessage }}>
      <Router basename={"/Hangman-MP/"}>
        <Routes>
          <Route
            path="/"
            element={isLoggedIn ? <HomePage onLogout={() => setIsLoggedIn(false)} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={
              <AuthPage formType={"login"} onLogin={() => setIsLoggedIn(true)} onLogout={() => setIsLoggedIn(false)} />
            }
          />
          <Route
            path="/register"
            element={isLoggedIn ? <Navigate to="/login" replace /> : <AuthPage formType={"signup"} />}
          />
        </Routes>
      </Router>
    </WebSocketProvider>
  );
}

export default App;

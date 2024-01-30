import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
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

  // For debugging purposes
  useEffect(() => {
    if (lastJsonMessage) {
      const { type, content } = lastJsonMessage;
      if (type !== "timerUpdate" || type !== "cooldownUpdate") {
        console.log(type, content);
      }
    }
  }, [lastJsonMessage]);

  return (
    <WebSocketProvider value={{ sendJsonMessage, lastJsonMessage }}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={isLoggedIn ? <HomePage onLogout={() => setIsLoggedIn(false)} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/" replace />
              ) : (
                <AuthPage formType={"login"} onLogin={() => setIsLoggedIn(true)} />
              )
            }
          />
          <Route
            path="/register"
            element={isLoggedIn ? <Navigate to="/" replace /> : <AuthPage formType={"signup"} />}
          />
        </Routes>
      </Router>
    </WebSocketProvider>
  );
}

export default App;

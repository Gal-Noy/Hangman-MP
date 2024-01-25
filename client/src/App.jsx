import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/AuthPage/Login";
import Signup from "./pages/AuthPage/Signup";
import useWebSocket from "react-use-websocket";
import { WebSocketProvider } from "./WebSocketContext";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("auth_token") && !!localStorage.getItem("user"));

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(import.meta.env.VITE_WS_URL, {
    onOpen: () => {
      console.log("WebSocket connection opened");
      if (isLoggedIn) {
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

  return (
    <WebSocketProvider value={{ sendJsonMessage, lastJsonMessage }}>
      <Router>
        <Routes>
          <Route
            path="/home"
            element={isLoggedIn ? <HomePage onLogout={() => setIsLoggedIn(false)} /> : <Navigate to="/login" replace />}
          />
          <Route path="/" element={<Navigate to={isLoggedIn ? "/home" : "/login"} replace />} />
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/home" replace /> : <Login onLogin={() => setIsLoggedIn(true)} />}
          />
          <Route path="/register" element={isLoggedIn ? <Navigate to="/home" replace /> : <Signup />} />
        </Routes>
      </Router>
    </WebSocketProvider>
  );
}

export default App;

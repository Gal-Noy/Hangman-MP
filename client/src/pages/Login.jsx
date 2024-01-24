import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useWebSocketContext } from "../WebSocketContext";

function Login({ onLogin }) {
  const { sendJsonMessage } = useWebSocketContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }
    axios
      .post(`${import.meta.env.VITE_SERVER_URL}/api/auth/login`, { email, password })
      .then((res) => {
        if (res.status === 200) {
          // console.log(res.data);
          const token = res.data.token;
          const user = JSON.stringify(res.data.user);
          localStorage.setItem("auth_token", token);
          localStorage.setItem("user", user);

          // Send login data to websocket server
          sendJsonMessage({
            type: "auth",
            content: {
              action: "login",
              data: { token, user },
            },
          });
          alert(res.data.msg);
          onLogin();
          navigate("/home");
        }
      })
      .catch((err) => {
        console.log(err);
        alert(err.response.data.msg);
      });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-secondary">
      <div className="bg-white p-4 rounded w-25">
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              <strong>Email address</strong>
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="form-control rounded-0"
              placeholder="Enter email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              <strong>Password</strong>
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className="form-control rounded-0"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-success w-100 rounded-0">
            Submit
          </button>
          <p className="text-center mt-3 text-muted">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-decoration-none">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;

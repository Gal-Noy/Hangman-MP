import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useWebSocketContext } from "../../WebSocketContext";
import { useDispatch } from "react-redux";
import { setLobby } from "../../store/clientStateSlice";

function Login(props) {
  const { onLogin, setSubmitResponseMessage } = props;
  const { sendJsonMessage } = useWebSocketContext();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignupClick = () => {
    setSubmitResponseMessage({ success: false, msg: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsPending(true);

    const { email, password } = loginData;

    if (!email || !password) {
      setSubmitResponseMessage({ success: false, msg: "Please fill in all fields" });
      setIsPending(false);
      return;
    }

    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");

    axios
      .post(`${import.meta.env.VITE_SERVER_URL}/api/auth/login`, { email, password }, { mode: "no-cors" })
      .then((res) => {
        if (res.status === 200) {
          const token = res.data.token;
          const user = JSON.stringify(res.data.user);
          localStorage.setItem("auth_token", token);
          localStorage.setItem("user", user);
          dispatch(setLobby());

          // Send login data to websocket server
          sendJsonMessage({
            type: "auth",
            content: {
              action: "login",
              data: { token, user },
            },
          });

          setSubmitResponseMessage({ success: true, msg: res.data.msg });
          onLogin();
          navigate("/home");
        } else {
          throw new Error("Could not login");
        }
      })
      .then(() => setIsPending(false))
      .catch((err) => {
        console.log(err);
        setIsPending(false);
        setSubmitResponseMessage({ success: false, msg: err.response.data.msg });
      });
  };

  return (
    <div>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
        />
        <button type="submit" className="auth-submit-button">
          {isPending ? <div class="lds-dual-ring"></div> : "Login"}
        </button>
      </form>
      <p className="auth-form-footer">
        Don&apos;t have an account?&nbsp;
        <Link to="/register" onClick={handleSignupClick}>
          Register
        </Link>
      </p>
    </div>
  );
}

export default Login;

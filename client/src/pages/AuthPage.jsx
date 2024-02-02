import React from "react";
import { useState } from "react";
import Login from "../components/AuthPage/Login";
import Signup from "../components/AuthPage/Signup";
import Logo from "../assets/logo.png";
import "../styles/AuthPage.scss";

function AuthPage(props) {
  const { formType, onLogin, onLogout } = props;
  const [submitResponseMessage, setSubmitResponseMessage] = useState({ success: false, msg: "" });

  return (
    <div className="auth-page">
      <div className="auth-block">
        <div className="auth-side-logo">
          <img src={Logo} alt="AuthPage Logo" id="hangman-logo" />
        </div>
        <div className="auth-form-div">
          {submitResponseMessage.msg && (
            <div
              className={`submit-response-msg ${submitResponseMessage.success ? "success" : "error"} show`}
              role="alert"
            >
              {submitResponseMessage.msg}
            </div>
          )}
          {formType === "login" ? (
            <Login onLogin={onLogin} onLogout={onLogout} setSubmitResponseMessage={setSubmitResponseMessage} />
          ) : (
            <Signup setSubmitResponseMessage={setSubmitResponseMessage} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

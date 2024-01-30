import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import defaultAvatar from "../../assets/default-avatar.jpg";
import axios from "axios";

function Signup({ setSubmitResponseMessage }) {
  const [signupData, setSignupData] = useState({
    avatar: null,
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(signupData.password === signupData.confirmPassword);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setPasswordsMatch(signupData.password === signupData.confirmPassword);
  }, [signupData.confirmPassword, signupData.password]);

  const handleLoginClick = () => {
    setSubmitResponseMessage({ success: false, msg: "" });
    setSignupSuccess(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsPending(true);

    const { name, email, password, confirmPassword } = signupData;

    if (!name || !email || !password || !confirmPassword) {
      setSubmitResponseMessage({ success: false, msg: "Please fill in all fields" });
      setIsPending(false);
      return;
    }

    if (password !== confirmPassword) {
      setSubmitResponseMessage({ success: false, msg: "Passwords do not match" });
      setIsPending(false);
      return;
    }

    axios
      .post(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/register`,
        { name, email, password, confirmPassword },
        { mode: "no-cors" }
      )
      .then((res) => {
        console.log(res);
        if (res.status === 200 || res.status === 201) {
          setSubmitResponseMessage({ success: true, msg: res.data.msg });
          setIsPending(false);
          setSignupSuccess(true);
        } else {
          throw new Error(res.data.msg);
        }
      })
      .then(() => setIsPending(false))
      .catch((err) => {
        setIsPending(false);
        setSubmitResponseMessage({ success: false, msg: err.response.data.msg });
      });
  };

  return (
    <div>
      {signupSuccess ? (
        <div>
          <h2>Signup Successful!</h2>
          <p>You have successfully signed up.</p>
          <Link to="/login" onClick={handleLoginClick}>
            Go to Login
          </Link>
        </div>
      ) : (
        <div>
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="signup-avatar">
              <input
                type="file"
                name="avatar"
                accept="image/*"
                id="add-avatar-input-signup"
                onChange={(e) => setSignupData({ ...signupData, avatar: e.target.files[0] })}
              />
              {signupData.avatar && (
                <div
                  className="cancel-button-signup-avatar"
                  onClick={() => setSignupData({ ...signupData, avatar: null })}
                >
                  <span className="material-symbols-outlined">cancel</span>
                </div>
              )}
              <img
                className="signup-avatar-img"
                src={signupData.avatar ? URL.createObjectURL(signupData.avatar) : defaultAvatar}
                alt=""
                onClick={() => document.getElementById("add-avatar-input-signup").click()}
              />
              <span className="signup-add-avatar-text" htmlFor="add-avatar-input-signup">
                Add an avatar
              </span>
            </div>
            <input
              type="text"
              name="name"
              placeholder="Name"
              onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className={`${passwordsMatch ? "" : "passwords-mismatch"}`}
              onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
            />
            <button type="submit" className="auth-submit-button">
              {isPending ? <div className="lds-dual-ring"></div> : "Sign up"}
            </button>
          </form>
          <p className="auth-form-footer">
            Already have an account?&nbsp;
            <Link to="/login" onClick={handleLoginClick}>
              Login
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

export default Signup;

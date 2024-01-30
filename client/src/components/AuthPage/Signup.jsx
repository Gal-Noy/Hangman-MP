import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function Signup({ setSubmitResponseMessage }) {
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
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
        if (res.status === 200) {
          setSubmitResponseMessage({ success: true, msg: res.data.msg });
          setIsPending(false);
          setSignupSuccess(true);
        } else {
          throw new Error("Could not register");
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
              {isPending ? <div class="lds-dual-ring"></div> : "Sign up"}
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

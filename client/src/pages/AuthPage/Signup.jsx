import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function Signup() {
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(signupData.password === signupData.confirmPassword);

  useEffect(() => {
    setPasswordsMatch(signupData.password === signupData.confirmPassword);
  }, [signupData.confirmPassword, signupData.password]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, email, password, confirmPassword } = signupData;

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    axios
      .post(`${import.meta.env.VITE_SERVER_URL}/api/auth/register`, { name, email, password, confirmPassword })
      .then((res) => {
        setSignupSuccess(true);
      })
      .catch((err) => {
        alert(err.response.data.msg);
      });
  };

  const SignupSuccess = () => (
    <div className="bg-light p-4 rounded w-25 text-center">
      <h2 className="text-success mb-4">Signup Successful!</h2>
      <p>You have successfully signed up.</p>
      <Link to="/login" className="btn btn-primary rounded-0">
        Go to Login
      </Link>
    </div>
  );

  return (
    <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
      {signupSuccess ? (
        <SignupSuccess />
      ) : (
        <div className="bg-light p-4 rounded w-25">
          <h2 className="text-center mb-4">Register</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                <strong>Name</strong>
              </label>
              <input
                type="text"
                name="name"
                className="form-control rounded-0"
                id="name"
                placeholder="Enter name"
                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                <strong>Email address</strong>
              </label>
              <input
                type="email"
                name="email"
                className="form-control rounded-0"
                id="email"
                placeholder="Enter email"
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                <strong>Password</strong>
              </label>
              <input
                type="password"
                name="password"
                className="form-control rounded-0"
                id="password"
                placeholder="Password"
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                {passwordsMatch ? (
                  <strong>Confirm Password</strong>
                ) : (
                  <strong className="text-danger">Confirm Password</strong>
                )}
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control rounded-0"
                id="confirmPassword"
                placeholder="Confirm Password"
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-success w-100 rounded-0">
              Submit
            </button>
            <p className="text-center mt-3 text-muted">
              Already have an account?{" "}
              <Link to="/login" className="text-decoration-none text-success">
                Login
              </Link>
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

export default Signup;

import { useState } from "react";
import "./Register.css";

function Register({onLoginClick}) {
  function hamdleSubmit(event) {
    event.preventDefault();
    console.log("Form Submitted!");
  }

  function handlePassword(event) {
    setPassword(event.target.value);
  }

  function handleShowPassword() {
    setShowPassword(!showPassword);
  }

  const [showPassword, setShowPassword] = useState(false);

  const [password, setPassword] = useState("");

  const [email, setEmail] = useState("");
  function handleEmail(event) {
    setEmail(event.target.value);
  }

  return (
    <main className="register-page">
      <section className="first-child">
        <h1>LearnHub</h1>
        <p>Learn together, grow together.</p>
      </section>
      <section className="last-child">
        <div className="register-container">
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p>Sign up to continue learning.</p>
          </div>

          <form onSubmit={hamdleSubmit}>
            <div className="email-input">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                onChange={handleEmail}
                value={email}
              ></input>
            </div>
            <div className="password-input">
              <label htmlFor="password">Password</label>
              <div className="password-input-field">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  onChange={handlePassword}
                  value={password}
                ></input>
                <button type="button" onClick={handleShowPassword}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="Remember">
                <input id="Remember" type="checkbox"></input>
                <label htmlFor="Remember">Remember me</label>
                <a href="#">Forgot password?</a>
              </div>
            </div>
            <button type="submit" className="sign-up">
              Sign Up
            </button>
            <button type="button" className="login" onClick={onLoginClick}>
              Login
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Register;

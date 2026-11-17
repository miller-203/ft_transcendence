import "./App.css";
import { useState } from "react";

function App() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    console.log("Login submitted");
  }

  return (
    <main>
      <h1>LearnHub</h1>
      <form className="login-container" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        ></input>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        ></input>
        <button>Login</button>
      </form>
    </main>
  );
}

export default App;

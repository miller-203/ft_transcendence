import { useState } from "react";
import Login from "./Login/Login.jsx";
import Register from "./Register/Register.jsx";

function App() {
  const [page, setPage] = useState("login");

  return (
    <>
      {page === "login" ? (
        <Login onRegisterClick={() => setPage("register")} />
      ) : (
        <Register onLoginClick={() => setPage("login")}/>
      )}
    </>
  );
}

export default App;

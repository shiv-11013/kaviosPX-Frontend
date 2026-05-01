import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromGoogle = params.get("token");

    if (tokenFromGoogle) {
      localStorage.setItem("token", tokenFromGoogle);
      navigate("/albums", { replace: true });
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        navigate("/albums", { replace: true });
      }
    }
  }, [navigate]);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    try {
      const res = await axios.post("/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/albums");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  // Fixed: Hardcoded the URL directly here
  const handleGoogleLogin = () => {
    window.location.href = "https://kaviospx.onrender.com/api/auth/google";
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Welcome Back</h2>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleEmailLogin}>Log in</button>

        <div className="divider">OR</div>

        <button onClick={handleGoogleLogin}>
          Continue with Google
        </button>

        <p onClick={() => navigate("/register")}>
          Don’t have an account? Sign up
        </p>
      </div>
    </div>
  );
};

export default Login;
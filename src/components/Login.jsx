import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { CameraIcon, GoogleIcon } from "./icons";
import { useToast } from "./useToast";

const Login = () => {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get("token");
    if (googleToken) {
      localStorage.setItem("token", googleToken);
      navigate("/albums", { replace: true });
    } else if (localStorage.getItem("token")) {
      navigate("/albums", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!email || !password)
      return showToast("Please enter email and password", "error");
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/albums");
    } catch {
      showToast("Invalid email or password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || "https://kaviospx.onrender.com"}/api/auth/google`;
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-logo">
          <div className="brand-logo-mark">
            <CameraIcon />
          </div>
          <span className="brand-logo-name">KaviosPx</span>
        </div>

        <div className="brand-tagline">
          <h1>
            Your photos,
            <br />
            <em>beautifully</em>
            <br />
            organised.
          </h1>
          <p>
            Upload, share, and relive your favourite moments — all in one
            private gallery.
          </p>
        </div>

        <div className="brand-mosaic" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="brand-mosaic-cell" />
          ))}
        </div>

        <div className="brand-filmstrip" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="brand-filmstrip-hole" />
          ))}
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <span className="auth-form-eyebrow">Sign in</span>
          <h2 className="auth-form-title">Welcome back</h2>
          <p className="auth-form-subtitle">
            Enter your credentials to access your gallery
          </p>

          <div className="input-group">
            <label className="input-label" htmlFor="login-email">
              Email address
            </label>
            <input
              id="login-email"
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoComplete="current-password"
            />
          </div>

          <button
            className="btn-primary"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div className="divider-row">
            <div className="divider-line" />
            <span className="divider-text">or</span>
            <div className="divider-line" />
          </div>

          <button className="btn-secondary" onClick={handleGoogleLogin}>
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="auth-switch">
            No account?{" "}
            <span className="link" onClick={() => navigate("/register")}>
              Create one free
            </span>
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Login;

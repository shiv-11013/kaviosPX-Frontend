import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useToast } from "./useToast";

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);


const Login = () => {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

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
    if (!email || !password) return showToast("Please enter email and password", "error");
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
      {/* ── Left brand ── */}
      <div className="auth-brand">
        <div className="brand-logo">
          <div className="brand-logo-mark"><CameraIcon /></div>
          <span className="brand-logo-name">KaviosPx</span>
        </div>

        <div className="brand-tagline">
          <h1>Your photos,<br /><em>beautifully</em><br />organised.</h1>
          <p>
            Upload, share, and relive your favourite moments —
            all in one private gallery.
          </p>
        </div>

        <div className="brand-mosaic" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="brand-mosaic-cell" />
          ))}
        </div>

        {/* Film-strip decoration */}
        <div className="brand-filmstrip" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="brand-filmstrip-hole" />
          ))}
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <span className="auth-form-eyebrow">Sign in</span>
          <h2 className="auth-form-title">Welcome back</h2>
          <p className="auth-form-subtitle">Enter your credentials to access your gallery</p>

          <div className="input-group">
            <label className="input-label" htmlFor="login-email">Email address</label>
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
            <label className="input-label" htmlFor="login-password">Password</label>
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

          <button className="btn-primary" onClick={handleLogin} disabled={loading}>
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
            <span className="link" onClick={() => navigate("/register")}>Create one free</span>
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Login;
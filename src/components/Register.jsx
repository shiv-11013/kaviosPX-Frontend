import { useState } from "react";
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

const Register = () => {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent]   = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    const { email, password, confirmPassword } = form;
    if (!email || !password || !confirmPassword) return showToast("All fields are required", "error");
    if (password !== confirmPassword) return showToast("Passwords do not match", "error");
    if (password.length < 6) return showToast("Password must be at least 6 characters", "error");

    setLoading(true);
    try {
      await axios.post("/api/auth/send-otp", { userEmail: email });
      setOtpSent(true);
      showToast("OTP sent! Redirecting…", "success");
      setTimeout(() => navigate("/verify-otp", { state: { email, password } }), 1500);
    } catch {
      showToast("Failed to send OTP. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left: brand ── */}
      <div className="auth-brand">
        <div className="brand-logo">
          <div className="brand-logo-icon"><CameraIcon /></div>
          <span className="brand-logo-name">KaviosPx</span>
        </div>
        <div className="brand-tagline">
          <h1>Store every<br /><span>moment</span><br />forever.</h1>
          <p>Create albums, add comments, share with friends — your gallery, your way.</p>
        </div>
        <div className="brand-grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="brand-grid-cell" style={{ opacity: 0.4 + (i % 3) * 0.2 }} />
          ))}
        </div>
      </div>

      {/* ── Right: form ── */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <h2 className="auth-form-title">Create account</h2>
          <p className="auth-form-subtitle">Get started with KaviosPx for free</p>

          {otpSent && <div className="success-msg">✓ OTP sent to your email!</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="input-group">
              <label className="input-label">First name</label>
              <input className="input-field" name="firstName" placeholder="Rahul" onChange={handleChange} />
            </div>
            <div className="input-group">
              <label className="input-label">Last name</label>
              <input className="input-field" name="lastName" placeholder="Sharma" onChange={handleChange} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email address</label>
            <input className="input-field" type="email" name="email" placeholder="you@example.com" onChange={handleChange} />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input className="input-field" type="password" name="password" placeholder="Min. 6 characters" onChange={handleChange} />
          </div>

          <div className="input-group">
            <label className="input-label">Confirm password</label>
            <input className="input-field" type="password" name="confirmPassword" placeholder="••••••••"
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            />
          </div>

          <button className="btn-primary" onClick={handleRegister} disabled={loading || otpSent}>
            {loading ? "Sending OTP…" : "Create account"}
          </button>

          <p className="auth-switch" style={{ marginTop: "20px" }}>
            Already have an account?{" "}
            <span className="link" onClick={() => navigate("/")}>Sign in</span>
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Register;
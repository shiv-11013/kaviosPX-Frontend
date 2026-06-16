import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";
import { useToast } from "./useToast";

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const OtpVerify = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { showToast, ToastContainer } = useToast();

  const [otp, setOtp]       = useState("");
  const [loading, setLoading] = useState(false);

  // Passed from Register page via navigate state
  const email    = location.state?.email;
  const password = location.state?.password;

  const handleVerify = async () => {
    if (!email || !password) {
      showToast("Session expired. Please register again.", "error");
      navigate("/register");
      return;
    }
    if (!otp || otp.length < 4) return showToast("Enter a valid OTP", "error");

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/verify-otp", {
        userEmail: email,
        otp,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/albums");
    } catch (err) {
      showToast(err?.response?.data?.message || "OTP verification failed", "error");
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
          <h1>One last<br /><span>step</span><br />to go.</h1>
          <p>
            We sent a 6-digit code to{" "}
            <strong style={{ color: "#f1f2f5" }}>{email || "your email"}</strong>.
            Enter it below to complete sign-up.
          </p>
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
          <h2 className="auth-form-title">Check your email</h2>
          <p className="auth-form-subtitle">Enter the verification code we sent you</p>

          <div className="input-group">
            <label className="input-label">Verification code</label>
            <input
              className="input-field otp-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            />
          </div>

          <button className="btn-primary" onClick={handleVerify} disabled={loading}>
            {loading ? "Verifying…" : "Verify & continue"}
          </button>

          <p className="auth-switch" style={{ marginTop: "20px" }}>
            Wrong email?{" "}
            <span className="link" onClick={() => navigate("/register")}>Go back</span>
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default OtpVerify;
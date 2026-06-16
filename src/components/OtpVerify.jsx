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

  const [otp, setOtp]         = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const email    = location.state?.email;
  const password = location.state?.password;
  const firstName = location.state?.firstName;
  const lastName  = location.state?.lastName;

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
        firstName,
        lastName,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/albums");
    } catch (err) {
      showToast(err?.response?.data?.message || "OTP verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await axios.post("/api/auth/send-otp", { userEmail: email });
      showToast("New OTP sent — check your inbox.", "success");
    } catch {
      showToast("Could not resend OTP. Try again.", "error");
    } finally {
      setResending(false);
    }
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
          <h1>One last<br /><em>step</em><br />to go.</h1>
          <p>
            We sent a 6-digit code to{" "}
            <strong style={{ color: "var(--text-1)", fontWeight: 500 }}>
              {email || "your email"}
            </strong>.
            Enter it below to confirm your identity.
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

      {/* ── Right form ── */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <span className="auth-form-eyebrow">Verify email</span>
          <h2 className="auth-form-title">Check your inbox</h2>
          <p className="auth-form-subtitle">Enter the 6-digit code we sent you</p>

          <div className="input-group">
            <label className="input-label" htmlFor="otp-input">Verification code</label>
            <input
              id="otp-input"
              className="input-field otp-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              autoFocus
              autoComplete="one-time-code"
            />
          </div>

          <button className="btn-primary" onClick={handleVerify} disabled={loading}>
            {loading ? "Verifying…" : "Verify & continue"}
          </button>

          <p className="auth-switch" style={{ marginTop: "20px" }}>
            Didn't receive it?{" "}
            <span
              className="link"
              onClick={handleResend}
              style={{ opacity: resending ? 0.5 : 1, pointerEvents: resending ? "none" : "auto" }}
            >
              {resending ? "Sending…" : "Resend code"}
            </span>
          </p>

          <p className="auth-switch" style={{ marginTop: "8px" }}>
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
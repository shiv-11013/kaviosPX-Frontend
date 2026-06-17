import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { CameraIcon } from "./icons";
import { useToast } from "./useToast";

const Register = () => {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    const { firstName, lastName, email, password, confirmPassword } = form;
    if (!firstName.trim() || !email || !password || !confirmPassword)
      return showToast("All fields are required", "error");
    if (password !== confirmPassword)
      return showToast("Passwords don't match", "error");
    if (password.length < 6)
      return showToast("Password must be at least 6 characters", "error");

    setLoading(true);
    try {
      await axios.post("/api/auth/send-otp", { userEmail: email });
      setOtpSent(true);
      showToast("OTP sent! Check your inbox.", "success");
      setTimeout(
        () =>
          navigate("/verify-otp", {
            state: { email, password, firstName, lastName },
          }),
        1500,
      );
    } catch {
      showToast("Failed to send OTP. Try again.", "error");
    } finally {
      setLoading(false);
    }
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
            Store every
            <br />
            <em>moment</em>
            <br />
            forever.
          </h1>
          <p>
            Create albums, add comments, share with friends — your gallery, your
            way.
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
          <span className="auth-form-eyebrow">Get started</span>
          <h2 className="auth-form-title">Create account</h2>
          <p className="auth-form-subtitle">Free forever. No card required.</p>

          {otpSent && (
            <div className="success-msg">
              <span>✓</span> OTP sent — check your email inbox!
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div className="input-group">
              <label className="input-label" htmlFor="reg-fname">
                First name
              </label>
              <input
                id="reg-fname"
                className="input-field"
                name="firstName"
                placeholder="Rahul"
                value={form.firstName}
                onChange={handleChange}
                autoComplete="given-name"
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="reg-lname">
                Last name
              </label>
              <input
                id="reg-lname"
                className="input-field"
                name="lastName"
                placeholder="Sharma"
                value={form.lastName}
                onChange={handleChange}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="reg-email">
              Email address
            </label>
            <input
              id="reg-email"
              className="input-field"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="reg-pwd">
              Password
            </label>
            <input
              id="reg-pwd"
              className="input-field"
              type="password"
              name="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="reg-confirm">
              Confirm password
            </label>
            <input
              id="reg-confirm"
              className="input-field"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              autoComplete="new-password"
            />
          </div>

          <button
            className="btn-primary"
            onClick={handleRegister}
            disabled={loading || otpSent}
          >
            {loading ? "Sending OTP…" : "Create account"}
          </button>

          <p className="auth-switch" style={{ marginTop: "24px" }}>
            Already have an account?{" "}
            <span className="link" onClick={() => navigate("/")}>
              Sign in
            </span>
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Register;

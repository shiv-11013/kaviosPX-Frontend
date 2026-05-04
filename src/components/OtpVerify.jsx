import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";

const OtpVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState("");

  const email = location.state?.email;
  const password = location.state?.password;

  const handleVerify = async () => {
    if (!otp) {
      alert("Enter OTP");
      return;
    }

    try {
      const res = await axios.post("/api/auth/verify-otp", {
        userEmail: email,
        otp,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/albums");
    } catch (err) {
      alert("OTP verification failed");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Enter OTP</h2>

        <input
          type="text"
          className="otp-input"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button onClick={handleVerify}>Verify OTP</button>
      </div>
    </div>
  );
};

export default OtpVerify;

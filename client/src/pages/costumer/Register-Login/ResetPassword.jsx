import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Input from "./input.jsx";
import styles from "./ForgotPassword.module.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [valid, setValid] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        },
      );

      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || "Reset failed");
        return;
      }

      setMessage("Password updated successfully!");

      setTimeout(() => navigate("/"), 2000);
    } catch {
      setMessage("Network error");
    }
  };

  return (
    <div className={styles.forgotWrapper}>
      <div className={styles.card}>
        <form onSubmit={handleSubmit}>
          <h1>Reset Password</h1>

          <Input
            type="password"
            placeholder="New Password"
            value={password}
            setValue={setPassword}
            enableStrength
            onValidChange={setValid}
          />

          {message && <p>{message}</p>}

          <button type="submit" className={styles.submitBtn} disabled={!valid}>
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

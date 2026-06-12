import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Input from "./input.jsx";
import styles from "./ForgotPassword.module.css";
import client from "../../../api/client";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [isPasswordValid, setPasswordValid] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    setMessage("");
    setIsLoading(true);

    try {
      await client.post(`/auth/reset-password/${token}`, { password });
      setIsError(false);
      setMessage("Password updated successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.forgotWrapper}>
      <div className={styles.card}>
        <form onSubmit={handleSubmit}>
          <h1>Reset Password</h1>
          <h6 className={styles.informationText}>
            Enter your new password below.
          </h6>

          <Input
            type="password"
            placeholder="New Password"
            value={password}
            setValue={setPassword}
            enableStrength
            onValidChange={setPasswordValid}
          />

          {message && (
            <p className={isError ? styles.errorMsg : styles.successMsg}>
              {message}
            </p>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!isPasswordValid || isLoading}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
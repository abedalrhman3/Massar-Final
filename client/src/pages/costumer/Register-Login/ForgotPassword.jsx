import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "./input.jsx";
import styles from "./ForgotPassword.module.css";
import client from "../../../api/client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isEmailValid, setEmailValid] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailValid) return;

    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      await client.post("/auth/forgot-password", { email });
      // Always show a neutral message to avoid email enumeration
      setMessage("If that email is registered, a reset link has been sent.");
    } catch (err) {
      // Still show the neutral message on error (don't reveal whether email exists)
      setMessage("If that email is registered, a reset link has been sent.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.forgotWrapper}>
      <div className={styles.card}>
        <form onSubmit={handleSubmit}>
          <h1>Forgot Password?</h1>
          <h6 className={styles.informationText}>
            Enter your registered email to reset your password.
          </h6>

          <Input
            type="email"
            placeholder="Email"
            value={email}
            setValue={setEmail}
            isEmail={true}
            onValidChange={setEmailValid}
            icon="bxs-envelope"
          />

          {message && <p className={styles.successMsg}>{message}</p>}
          {error && <p className={styles.errorMsg}>{error}</p>}

          <div className={`${styles.field} ${styles.btn}`}>
            <div className={styles.btnLayer}></div>
            <input
              type="submit"
              value={isLoading ? "Sending..." : "Reset Password"}
              disabled={!isEmailValid || isLoading}
            />
          </div>

          <div className={styles.footer}>
            <h5>
              Not a member? <Link to="/register">Sign Up</Link>
            </h5>
            <h5>
              Already have an account? <Link to="/login">Sign In</Link>
            </h5>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
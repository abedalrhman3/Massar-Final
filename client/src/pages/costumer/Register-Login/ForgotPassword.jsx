import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "./input.jsx";
import styles from "./ForgotPassword.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isEmailValid, setEmailValid] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailValid) return;

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      await res.json();

      alert("If that email exists, a reset link was sent.");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.forgotWrapper}>
      <div className={styles.card}>
        <form onSubmit={handleSubmit}>
          <h1>Forgot Password ?</h1>
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

          <div className={`${styles.field} ${styles.btn}`}>
            <div className={styles.btnLayer}></div>
            <input
              type="submit"
              value="Reset Password"
              disabled={!isEmailValid}
            />
          </div>

          <div className={styles.footer}>
            <h5>
              Not a member? <Link to="/register">Sign Up</Link>
            </h5>
            <h5>
              Already have an account? <Link to="/">Sign In</Link>
            </h5>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

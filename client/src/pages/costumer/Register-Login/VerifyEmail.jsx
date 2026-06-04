import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./ForgotPassword.module.css";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/auth/verify-email/${token}`,
        );
        const data = await res.json();

        if (data.success) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message);
        }
      } catch {
        setStatus("error");
        setMessage("Network error. Please try again.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className={styles.forgotWrapper}>
      <div className={styles.card} style={{ textAlign: "center" }}>
        {status === "loading" && (
          <>
            <h1>Verifying...</h1>
            <p style={{ color: "#888", marginTop: "12px" }}>
              Please wait while we verify your email.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 style={{ color: "#18e605" }}>✅ Email Verified!</h1>
            <p style={{ color: "#444", marginTop: "12px" }}>{message}</p>
            <Link
              to="/"
              style={{
                display: "inline-block",
                marginTop: "20px",
                padding: "12px 28px",
                background: "#7494ec",
                color: "#fff",
                borderRadius: "30px",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "15px",
              }}
            >
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 style={{ color: "#ff4d4d" }}>❌ Verification Failed</h1>
            <p style={{ color: "#444", marginTop: "12px" }}>{message}</p>
            <Link
              to="/register"
              style={{
                display: "inline-block",
                marginTop: "20px",
                padding: "12px 28px",
                background: "#7494ec",
                color: "#fff",
                borderRadius: "30px",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "15px",
              }}
            >
              Back to Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

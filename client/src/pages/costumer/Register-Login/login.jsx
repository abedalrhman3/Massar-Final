import { useState, useEffect } from "react";
import Input from "./input.jsx";
import { Link, useNavigate } from "react-router-dom";
import styles from "./registerLogin.module.css";
import { login, loginWithGoogle } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { BASE_URL } from "@/api/client";

const Login = ({ fields, setFields }) => {
  const navigate = useNavigate();
  const { loginSuccess } = useAuth();

  const [isEmailValid, setEmailValid] = useState(false);
  const [isPasswordValid, setPasswordValid] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid = isEmailValid && isPasswordValid;

  // Pick up user data dropped by OAuth redirect (?user=<json>)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get("user");
    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        loginSuccess(userData);
        window.history.replaceState({}, "", window.location.pathname);
        navigate("/");
      } catch (_) { }
    }
  }, [navigate, loginSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setServerError("");
    setIsLoading(true);

    try {
      const res = await login({ email: fields.email, password: fields.password });
      // res.data = { success, token, user }
      // The JWT is set as an HTTPOnly cookie by the server automatically.
      // We just need to store the user object in context.
      loginSuccess(res.data.user);
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    // Redirect to backend OAuth — server sets cookie and redirects back
    window.location.href = `${BASE_URL}/api/auth/${provider}`;
  };

  return (
    <div className={`${styles.formBox} ${styles.login}`}>
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>

        <div className={styles.fieldGroup}>
          <label>
            Email <span>*</span>
          </label>
          <Input
            type="email"
            placeholder="Email"
            icon="bxs-envelope"
            value={fields.email}
            setValue={(v) => setFields({ ...fields, email: v })}
            isEmail
            onValidChange={setEmailValid}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>
            Password <span>*</span>
          </label>
          <Input
            type="password"
            placeholder="Password"
            value={fields.password}
            setValue={(v) => setFields({ ...fields, password: v })}
            onValidChange={setPasswordValid}
          />
        </div>

        {serverError && <p className={styles.errorMsg}>{serverError}</p>}

        <button
          type="submit"
          className={styles.btn}
          disabled={!isFormValid || isLoading}
        >
          <div className={styles.btnLayer}></div>
          <span className={styles.btnText}>{isLoading ? "Logging in..." : "Login"}</span>
        </button>

        <div className={styles.divider}>
          <span>or continue with</span>
        </div>

        <div className={styles.socialBtns}>
          {/* Google */}
          <button
            type="button"
            className={`${styles.socialBtn} ${styles.google}`}
            onClick={() => handleOAuth("google")}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.2 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.3C9.6 35.7 16.3 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C37.1 39 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
            </svg>
            Google
          </button>


        </div>

        <div className={styles.forgotLink} style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/support"> Contact support</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
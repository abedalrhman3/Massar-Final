import Input from "./input.jsx";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import styles from "./registerLogin.module.css";
import { register } from "@/api/auth";
import { BASE_URL } from "@/api/client";


const Dropdown = ({ options, placeholder, value, setValue }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className={styles.customDropdown}>
      <div className={styles.selected} onClick={() => setOpen(!open)}>
        {value || placeholder}
        <span className={`${styles.arrow} ${open ? styles.up : styles.down}`}></span>
      </div>
      {open && (
        <ul className={styles.dropdownList}>
          {options.map((opt, idx) => (
            <li key={idx} onClick={() => { setValue(opt); setOpen(false); }}>
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Register = ({
  fields,
  setFields,
  birthDay,
  setBirthDay,
  birthMonth,
  setBirthMonth,
  birthYear,
  setBirthYear,
  agreeTerms,
  setAgreeTerms,
}) => {
  const [isUsernameValid, setUsernameValid] = useState(false);
  const [isEmailValid, setEmailValid] = useState(false);
  const [isPasswordValid, setPasswordValid] = useState(false);
  const [isConfirmValid, setConfirmValid] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false); // ← success state

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => (currentYear - i).toString());

  const isFormValid =
    isUsernameValid &&
    isEmailValid &&
    isPasswordValid &&
    isConfirmValid &&
    birthDay &&
    birthMonth &&
    birthYear &&
    agreeTerms;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setServerError("");
    setIsLoading(true);

    try {
      await register({
        name: fields.username,
        email: fields.email,
        password: fields.password,
      });
      setRegistered(true);
    } catch (err) {
      setServerError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `${BASE_URL}/api/auth/${provider}`;
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (registered) {
    return (
      <div className={`${styles.formBox} ${styles.register}`}>
        <div style={{ textAlign: "center", padding: "32px 16px" }}>
          <div style={{ fontSize: "52px", marginBottom: "16px" }}>✉️</div>
          <h2 style={{ marginBottom: "12px" }}>Check your email</h2>
          <p style={{ color: "#666", lineHeight: "1.6", marginBottom: "24px" }}>
            We sent a verification link to <strong>{fields.email}</strong>.
            <br />
            Click the link in the email to activate your account.
          </p>
          <p style={{ color: "#999", fontSize: "13px", marginBottom: "24px" }}>
            Didn't receive it? Check your spam folder. The link expires in 24 hours.
          </p>
          <Link
            to="/"
            style={{
              display: "inline-block",
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
        </div>
      </div>
    );
  }

  
  return (
    <div className={`${styles.formBox} ${styles.register}`}>
      <form onSubmit={handleSubmit}>
        <h1>Registration</h1>

        <div className={styles.fieldGroup}>
          <label>Username <span>*</span></label>
          <Input
            type="text"
            placeholder="Username"
            icon="bxs-user"
            value={fields.username}
            setValue={(v) => setFields({ ...fields, username: v })}
            onValidChange={setUsernameValid}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Email <span>*</span></label>
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
          <label>Password <span>*</span></label>
          <Input
            type="password"
            placeholder="Password"
            value={fields.password}
            setValue={(v) => setFields({ ...fields, password: v })}
            enableStrength
            onValidChange={setPasswordValid}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Confirm Password <span>*</span></label>
          <Input
            type="password"
            placeholder="Confirm Password"
            value={fields.confirm}
            setValue={(v) => setFields({ ...fields, confirm: v })}
            compareWith={fields.password}
            onValidChange={setConfirmValid}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Birthdate <span>*</span></label>
          <div className={styles.birthdateGroup}>
            <Dropdown options={days} placeholder="Day" value={birthDay} setValue={setBirthDay} />
            <Dropdown options={months} placeholder="Month" value={birthMonth} setValue={setBirthMonth} />
            <Dropdown options={years} placeholder="Year" value={birthYear} setValue={setBirthYear} />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.checkBox}>
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className={styles.customCheckbox}
            />
            <span className={styles.agreeLabel}>I agree to</span>{" "}
            <Link to="/terms">Terms of Use</Link>{" "}
            <span className={styles.agreeLabel}>and</span>{" "}
            <Link to="/privacy">Privacy Policy</Link> <span>*</span>
          </label>
        </div>

        {serverError && <p className={styles.errorMsg}>{serverError}</p>}

        <button type="submit" className={styles.btn} disabled={!isFormValid || isLoading}>
          <div className={styles.btnLayer}></div>
          <span className={styles.btnText}>{isLoading ? "Creating account..." : "Register"}</span>
        </button>

        <div className={styles.divider}>
          <span>or sign up with</span>
        </div>

        <div className={styles.socialBtns}>
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
      </form>
    </div>
  );
};

export default Register;
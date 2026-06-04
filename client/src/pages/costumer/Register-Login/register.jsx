import Input from "./input.jsx";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import styles from "./registerLogin.module.css";

const SERVER = "http://localhost:5000";

//  Dropdown for Birthdate
const Dropdown = ({ options, placeholder, value, setValue }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className={styles.customDropdown}>
      <div className={styles.selected} onClick={() => setOpen(!open)}>
        {value || placeholder}
        <span
          className={`${styles.arrow} ${open ? styles.up : styles.down}`}
        ></span>
      </div>
      {open && (
        <ul className={styles.dropdownList}>
          {options.map((opt, idx) => (
            <li
              key={idx}
              onClick={() => {
                setValue(opt);
                setOpen(false);
              }}
            >
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
  const [serverMessage, setServerMessage] = useState("");
  const [serverError, setServerError] = useState("");

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) =>
    (currentYear - i).toString(),
  );

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
    setServerMessage("");
    setServerError("");

    const body = {
      username: fields.username,
      email: fields.email,
      password: fields.password,
      birthDay,
      birthMonth: new Date(`${birthMonth} 1`).getMonth() + 1,
      birthYear,
    };

    try {
      const res = await fetch(`${SERVER}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        setServerError(data.message);
        return;
      }
      setServerMessage(
        "Account created! Please check your email (" +
          fields.email +
          ") to verify your account before logging in.",
      );
    } catch {
      setServerError("Network error. Try again.");
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `${SERVER}/api/auth/${provider}`;
  };

  return (
    <div className={`${styles.formBox} ${styles.register}`}>
      <form onSubmit={handleSubmit}>
        <h1>Registration</h1>

        <div className={styles.fieldGroup}>
          <label>
            Username <span>*</span>
          </label>
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
            enableStrength
            onValidChange={setPasswordValid}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>
            Confirm Password <span>*</span>
          </label>
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
          <label>
            Birthdate <span>*</span>
          </label>
          <div className={styles.birthdateGroup}>
            <Dropdown
              options={days}
              placeholder="Day"
              value={birthDay}
              setValue={setBirthDay}
            />
            <Dropdown
              options={months}
              placeholder="Month"
              value={birthMonth}
              setValue={setBirthMonth}
            />
            <Dropdown
              options={years}
              placeholder="Year"
              value={birthYear}
              setValue={setBirthYear}
            />
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
        {serverMessage && <p className={styles.successMsg}>{serverMessage}</p>}

        <button type="submit" className={styles.btn} disabled={!isFormValid}>
          <div className={styles.btnLayer}></div>
          <span className={styles.btnText}>Register</span>
        </button>

        <div className={styles.divider}>
          <span>or sign up with</span>
        </div>

        <div className={styles.socialBtns}>
          {/* Google */}
          <button
            type="button"
            className={`${styles.socialBtn} ${styles.google}`}
            onClick={() => handleOAuth("google")}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.2 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.3C9.6 35.7 16.3 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C37.1 39 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
              />
            </svg>
            Google
          </button>

          {/* Facebook */}
          <button
            type="button"
            className={`${styles.socialBtn} ${styles.facebook}`}
            onClick={() => handleOAuth("facebook")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99H7.9v-2.89h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99C18.34 21.12 22 16.99 22 12z" />
            </svg>
            Facebook
          </button>

          {/* Discord */}
          <button
            type="button"
            className={`${styles.socialBtn} ${styles.discord}`}
            onClick={() => handleOAuth("discord")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Discord
          </button>

          {/* Instagram */}
          <button
            type="button"
            className={`${styles.socialBtn} ${styles.instagram}`}
            onClick={() => handleOAuth("instagram")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
            Instagram
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;

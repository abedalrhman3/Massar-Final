import React, { useState, useEffect } from "react";
import Login from "./login.jsx";
import Register from "./register.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import ResetPassword from "./ResetPassword.jsx";
import VerifyEmail from "./VerifyEmail.jsx";
import styles from "./registerLogin.module.css";
import { useLocation } from "react-router-dom";

function AppWrapper() {
  const location = useLocation();
  const [isActive, setIsActive] = useState(false);

  // Automatically activate register form if route is /register
  useEffect(() => {
    if (location.pathname === "/register") {
      setIsActive(true);
    } else if (location.pathname === "/") {
      setIsActive(false);
    }
  }, [location.pathname]);

  // Store all input values
  const [loginFields, setLoginFields] = useState({
    email: "",
    password: "",
  });
  const [registerFields, setRegisterFields] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });

  // Add birthdate states
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");

  const [agreeTerms, setAgreeTerms] = useState(false);

  const resetFields = () => {
    setLoginFields({ email: "", password: "" });
    setRegisterFields({ username: "", email: "", password: "", confirm: "" });
    setBirthDay("");
    setBirthMonth("");
    setBirthYear("");
    setAgreeTerms(false);
  };

  const handleToggle = (toRegister) => {
    setIsActive(toRegister);
    resetFields();
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={`${styles.container} ${isActive ? styles.active : ""}`}>
        <Login fields={loginFields} setFields={setLoginFields} />

        <Register
          fields={registerFields}
          setFields={setRegisterFields}
          birthDay={birthDay}
          setBirthDay={setBirthDay}
          birthMonth={birthMonth}
          setBirthMonth={setBirthMonth}
          birthYear={birthYear}
          setBirthYear={setBirthYear}
          agreeTerms={agreeTerms}
          setAgreeTerms={setAgreeTerms}
        />

        <div className={styles.toggleBox}>
          <div className={`${styles.togglePanel} ${styles.toggleLeft}`}>
            <h1>Hello, Welcome!</h1>
            <p>Don't have an account?</p>
            <button
              className={`${styles.btn} ${styles.registerBtn}`}
              onClick={() => handleToggle(true)}
            >
              <span className={styles.btnText}>Register</span>
            </button>
          </div>

          <div className={`${styles.togglePanel} ${styles.toggleRight}`}>
            <h1>Welcome Back!</h1>
            <p>Already have an account?</p>
            <button
              className={`${styles.btn} ${styles.loginBtn}`}
              onClick={() => handleToggle(false)}
            >
              <span className={styles.btnText}>Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppWrapper;
export { AppWrapper, ForgotPassword, ResetPassword, VerifyEmail };
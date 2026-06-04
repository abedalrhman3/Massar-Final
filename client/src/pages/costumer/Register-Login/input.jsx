import { useState, useEffect, useRef } from "react";
import styles from "./registerLogin.module.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Input = ({
  type,
  placeholder,
  icon,
  value,
  setValue,
  enableStrength = false,
  onValidChange,
  compareWith,
  isEmail = false,
}) => {
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailErrors, setEmailErrors] = useState([]);
  const inputRef = useRef(null);

  const rules = {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  };

  const score = Object.values(rules).filter(Boolean).length;
  const isStrong = score === 4;

  const isMatch =
    compareWith !== undefined
      ? touched && value !== "" && value === compareWith
      : true;

  useEffect(() => {
    let errors = [];
    let valid = false;

    if (isEmail) {
      if (!value) {
        if (touched) errors.push("Email is required");
        valid = false;
      } else if (!emailRegex.test(value)) {
        errors.push("Enter a valid email address");
        valid = false;
      } else {
        valid = true;
      }
    }

    setEmailErrors(errors);

    if (onValidChange) {
      if (enableStrength) onValidChange(isStrong);
      else if (compareWith !== undefined) onValidChange(isMatch);
      else if (isEmail) onValidChange(valid);
      else onValidChange(value.length > 0);
    }
  }, [
    value,
    touched,
    isEmail,
    enableStrength,
    isStrong,
    compareWith,
    isMatch,
    onValidChange,
  ]);

  const getBarStyle = () => {
    if (!enableStrength || value.length === 0) return {};
    let background = "";
    let boxShadow = "";
    if (score <= 1) {
      background = "#ff4d4d";
    } else if (score <= 3) {
      background = "linear-gradient(90deg, #ff4d4d, #eedc3d)";
      boxShadow = "0 0 6px #eedc3d";
    } else {
      background = "linear-gradient(90deg, #eedc3d, #18e605)";
      boxShadow = "0 0 10px #18e605, 0 0 20px #18e605, 0 0 30px #18e605";
    }
    return { width: `${(score / 4) * 100}%`, background, boxShadow };
  };

  return (
    <div
      className={`${styles.inputBox} ${
        compareWith !== undefined && touched && !isMatch ? styles.mismatch : ""
      } ${isEmail && emailErrors.length > 0 ? styles.invalid : ""}`}
    >
      <div
        className={`${styles.inputWrapper} ${enableStrength && value ? styles.shrink : ""}`}
        ref={inputRef}
      >
        <input
          type={type === "password" && showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setTouched(true)}
          className={isEmail && emailErrors.length > 0 ? styles.error : ""}
          spellCheck={false}
          autoComplete="new-password"
          autoCorrect="off"
        />

        {icon && type !== "password" && (
          <i className={`bx ${icon} ${styles.fieldIcon}`}></i>
        )}

        {type === "password" && (
          <i
            className={`bx ${showPassword ? "bx-hide" : "bx-show"} ${styles.eyeIcon}`}
            onClick={() => setShowPassword(!showPassword)}
          ></i>
        )}

        {isEmail && emailErrors.length > 0 && (
          <div className={styles.emailHints}>
            {emailErrors.map((err, idx) => (
              <div key={idx} className={styles.hintText}>
                {err}
              </div>
            ))}
          </div>
        )}
      </div>

      {enableStrength && value && (
        <>
          <div className={styles.strengthMeter}>
            <div className={styles.strengthBar} style={getBarStyle()}></div>
          </div>
          <ul className={styles.passwordRules}>
            <li className={rules.length ? styles.ok : ""}>8+ characters</li>
            <li className={rules.upper ? styles.ok : ""}>Uppercase letter</li>
            <li className={rules.number ? styles.ok : ""}>Number</li>
            <li className={rules.special ? styles.ok : ""}>
              Special character
            </li>
          </ul>
        </>
      )}

      {compareWith !== undefined && touched && value && (
        <span
          className={`${styles.confirmText} ${isMatch ? styles.ok : styles.mismatchText}`}
        >
          {isMatch ? "Passwords match" : "Passwords do not match"}
        </span>
      )}
    </div>
  );
};

export default Input;

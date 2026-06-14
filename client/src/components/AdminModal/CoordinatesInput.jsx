import { useState } from "react";
import styles from "./AdminModal.module.css";


const validateCoordinates = (value) => {
  if (!value) return true; 
  const coordRegex = /^[+-]?\d{1,3}\.\d{4,6},\s*[+-]?\d{1,3}\.\d{4,6}$/;
  return coordRegex.test(value.trim());
};

function CoordinatesInput({ value, onChange, onBlur, error }) {
  const [localError, setLocalError] = useState("");

  const handleBlur = (e) => {
    const val = e.target.value;
    if (val && !validateCoordinates(val)) {
      setLocalError("Invalid coordinates. Use format: 31.9522, 35.2332");
    } else {
      setLocalError("");
    }
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    onChange(e);
    if (localError) {
      setLocalError("");
    }
  };

  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>Coordinates</label>
      <input
        type="text"
        className={styles.input}
        placeholder="e.g., 31.9522, 35.2332"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {(localError || error) && (
        <span className={styles.errorText}>
          {localError || error}
        </span>
      )}
    </div>
  );
}

export default CoordinatesInput;
export { validateCoordinates };
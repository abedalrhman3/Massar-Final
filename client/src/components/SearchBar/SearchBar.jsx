import { useState } from "react";
import styles from "./SearchBar.module.css";

function SearchBar({ placeholder, onSearch, value: controlledValue }) {
  const [localValue, setLocalValue] = useState("");

  // Support both controlled (value prop) and uncontrolled usage
  const value = controlledValue !== undefined ? controlledValue : localValue;

  const handleChange = (e) => {
    const v = e.target.value;
    if (controlledValue === undefined) setLocalValue(v);
    if (onSearch) onSearch(v);
  };

  const handleClear = () => {
    if (controlledValue === undefined) setLocalValue("");
    if (onSearch) onSearch("");
  };

  return (
    <div className={styles.searchBar}>
      <i className="fas fa-search" aria-hidden="true" />
      <input
        type="text"
        value={value}
        placeholder={placeholder || "Search for a destination"}
        onChange={handleChange}
        aria-label="Search destinations"
      />
      {value && (
        <button
          className={styles.clearBtn}
          onClick={handleClear}
          aria-label="Clear search"
          type="button"
        >
          <i className="fas fa-times" />
        </button>
      )}
    </div>
  );
}

export default SearchBar;

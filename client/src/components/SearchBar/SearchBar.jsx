import styles from "./SearchBar.module.css";

function SearchBar({ placeholder, onSearch }) {
  return (
    <div className={styles.searchBar}>
      <i className="fas fa-search"></i>
      <input
        type="text"
        placeholder={placeholder || "Search for a destination"}
        onChange={(e) => onSearch && onSearch(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;

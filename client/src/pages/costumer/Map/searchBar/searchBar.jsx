
import styles from "./searchBar.module.css"

const SearchBar = () => {
    return (
        <div className={styles["search-bar"]}>
            <input type="text" placeholder="Search for destination, places..." />
            <button className={styles["search-btn"]}>
                <span className="material-symbols-outlined">search</span>
            </button>
        </div>
    )
}

export default SearchBar
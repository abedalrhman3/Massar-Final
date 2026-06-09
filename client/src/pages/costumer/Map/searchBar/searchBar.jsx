import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLocations } from "@/api/locations";
import styles from "./searchBar.module.css";

const SearchBar = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const isAr = i18n.language === "ar";

    const [query, setQuery] = useState("");
    const [allLocations, setAllLocations] = useState([]); // full list fetched once
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const debounceRef = useRef(null);

    // Fetch full location list once on mount for reliable client-side filtering
    useEffect(() => {
        getLocations({})
            .then((res) => setAllLocations(Array.isArray(res.data) ? res.data : []))
            .catch(() => setAllLocations([]));
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filterLocally = useCallback(
        (value) => {
            if (!value.trim()) {
                setResults([]);
                setOpen(false);
                return;
            }
            const q = value.toLowerCase();
            const filtered = allLocations.filter((loc) => {
                const nameAr = (loc.name || "").toLowerCase();
                const nameEn = (loc.name_en || "").toLowerCase();
                const descAr = (loc.description || "").toLowerCase();
                const descEn = (loc.description_en || "").toLowerCase();
                return nameAr.includes(q) || nameEn.includes(q) || descAr.includes(q) || descEn.includes(q);
            });
            setResults(filtered);
            setOpen(true);
        },
        [allLocations]
    );

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => filterLocally(value), 150);
    };

    const handleSelect = (loc) => {
        setQuery(isAr ? loc.name : loc.name_en);
        setOpen(false);
        navigate("/map", {
            state: {
                lat: loc.coordinates.lat,
                lng: loc.coordinates.lng,
                name: isAr ? loc.name : loc.name_en,
                destinationId: loc.destination_id,
            },
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (results.length > 0) handleSelect(results[0]);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
        }
    };

    return (
        <div className={styles["search-bar-wrapper"]} ref={containerRef}>
            <form className={styles["search-bar"]} onSubmit={handleSubmit} role="search">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.trim() && results.length > 0 && setOpen(true)}
                    placeholder={isAr ? "ابحث عن وجهة أو مكان..." : "Search for destination, places..."}
                    autoComplete="off"
                    aria-label={isAr ? "بحث" : "Search"}
                    aria-autocomplete="list"
                    aria-expanded={open}
                />
                <button
                    type="submit"
                    className={styles["search-btn"]}
                    aria-label={isAr ? "بحث" : "Search"}
                >
                    {loading ? (
                        <span className={styles["spinner"]} aria-hidden="true" />
                    ) : (
                        <span className="material-symbols-outlined">search</span>
                    )}
                </button>
            </form>

            {open && (
                <ul
                    className={styles["search-dropdown"]}
                    role="listbox"
                    aria-label={isAr ? "نتائج البحث" : "Search results"}
                >
                    {results.length === 0 ? (
                        <li className={styles["search-empty"]}>
                            {isAr ? "لا توجد نتائج" : "No results found"}
                        </li>
                    ) : (
                        results.map((loc) => (
                            <li
                                key={loc._id}
                                role="option"
                                className={styles["search-result-item"]}
                                onMouseDown={() => handleSelect(loc)}
                            >
                                <span className={`material-symbols-outlined ${styles["result-icon"]}`}>
                                    location_on
                                </span>
                                <div className={styles["result-text"]}>
                                    <span className={styles["result-name"]}>
                                        {isAr ? loc.name : loc.name_en}
                                    </span>
                                    {(loc.description || loc.description_en) && (
                                        <span className={styles["result-desc"]}>
                                            {isAr ? loc.description : loc.description_en}
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;
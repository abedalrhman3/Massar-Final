import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminGlobalSearch.module.css";

import { getDestinations } from "@/api/destination";
import { placesApi, restaurantsApi, hotelsApi } from "@/api/listings";
import { getEvents } from "@/api/events";
import { getAllUsers } from "@/api/auth";

// ── Icon map per category ────────────────────────────────────────────────────
const CATEGORY_META = {
  Destinations: { icon: "travel_explore", color: "#6366f1" },
  Restaurants:  { icon: "restaurant",     color: "#f59e0b" },
  Places:       { icon: "place",          color: "#10b981" },
  Hotels:       { icon: "hotel",          color: "#3b82f6" },
  Events:       { icon: "event",          color: "#ec4899" },
  Users:        { icon: "person",         color: "#8b5cf6" },
};

// ── Slug helper (mirrors server) ─────────────────────────────────────────────
const toSlug = (name = "") =>
  name.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

function AdminGlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);       // { category, label, sublabel, path }[]
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [allData, setAllData] = useState(null);     // cached after first load
  const [dataLoading, setDataLoading] = useState(false);

  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // ── Close dropdown when clicking outside ────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Fetch all data once (lazy, on first focus) ──────────────────────────────
  const fetchAllData = useCallback(async () => {
    if (allData || dataLoading) return;
    setDataLoading(true);
    try {
      const [destsRes, placesRes, restaurantsRes, hotelsRes, eventsRes, usersRes] =
        await Promise.allSettled([
          getDestinations(),
          placesApi.getAll(),
          restaurantsApi.getAll(),
          hotelsApi.getAll(),
          getEvents(),
          getAllUsers(),
        ]);

      const safe = (res, path) => {
        if (res.status === "fulfilled") {
          const d = res.value?.data;
          if (!d) return [];
          // Handle both { data: [] } and { users: [] } shapes
          return d[path] ?? d.data ?? [];
        }
        return [];
      };

      setAllData({
        destinations: safe(destsRes, "data"),
        places:       safe(placesRes, "data"),
        restaurants:  safe(restaurantsRes, "data"),
        hotels:       safe(hotelsRes, "data"),
        events:       safe(eventsRes, "data"),
        users:        safe(usersRes, "users"),
      });
    } catch (err) {
      console.error("AdminGlobalSearch: failed to load data", err);
    } finally {
      setDataLoading(false);
    }
  }, [allData, dataLoading]);

  // ── Filter results whenever query changes ────────────────────────────────────
  useEffect(() => {
    if (!query.trim() || !allData) {
      setResults([]);
      setOpen(!!query.trim());
      return;
    }

    const q = query.toLowerCase().trim();
    const matched = [];

    // Helper: push up to 5 matches per category
    const addMatches = (items, category, labelFn, sublabelFn, pathFn) => {
      let count = 0;
      for (const item of items) {
        if (count >= 5) break;
        const label = labelFn(item) || "";
        const sublabel = sublabelFn ? sublabelFn(item) || "" : "";
        if (
          label.toLowerCase().includes(q) ||
          sublabel.toLowerCase().includes(q)
        ) {
          matched.push({ category, label, sublabel, path: pathFn(item) });
          count++;
        }
      }
    };

    addMatches(
      allData.destinations,
      "Destinations",
      (d) => d.name,
      (d) => d.tagline || d.description || "",
      (d) => `/admin/destinations/${d.slug || toSlug(d.name)}`
    );

    addMatches(
      allData.restaurants,
      "Restaurants",
      (r) => r.name,
      (r) => r.destinationId?.name || r.customOverview || "",
      (r) => {
        const slug = r.destinationId?.slug || toSlug(r.destinationId?.name || "");
        return slug ? `/admin/destinations/${slug}` : "/admin/destinations";
      }
    );

    addMatches(
      allData.places,
      "Places",
      (p) => p.name,
      (p) => p.destinationId?.name || p.customOverview || "",
      (p) => {
        const slug = p.destinationId?.slug || toSlug(p.destinationId?.name || "");
        return slug ? `/admin/destinations/${slug}` : "/admin/destinations";
      }
    );

    addMatches(
      allData.hotels,
      "Hotels",
      (h) => h.name,
      (h) => h.destinationId?.name || h.customOverview || "",
      (h) => {
        const slug = h.destinationId?.slug || toSlug(h.destinationId?.name || "");
        return slug ? `/admin/destinations/${slug}` : "/admin/destinations";
      }
    );

    addMatches(
      allData.events,
      "Events",
      (e) => e.name,
      (e) => e.destinationId?.name || "",
      (e) => {
        const slug = e.destinationId?.slug || toSlug(e.destinationId?.name || "");
        return slug ? `/admin/destinations/${slug}` : "/admin/destinations";
      }
    );

    addMatches(
      allData.users,
      "Users",
      (u) => u.name || u.email,
      (u) => u.email || "",
      (u) => `/admin/accounts`
    );

    setResults(matched);
    setOpen(true);
  }, [query, allData]);

  // ── Group results by category ─────────────────────────────────────────────
  const grouped = results.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleFocus = () => {
    fetchAllData();
    if (query.trim()) setOpen(true);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleSelect = (path) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const isEmpty = results.length === 0 && query.trim().length > 0 && !dataLoading;

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={`${styles.inputWrapper} ${open ? styles.inputWrapperOpen : ""}`}>
        <span className={`material-symbols-outlined ${styles.searchIcon}`}>
          {dataLoading ? "hourglass_top" : "search"}
        </span>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="Search destinations, hotels, events, users…"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          aria-label="Global admin search"
          id="admin-global-search"
          autoComplete="off"
        />
        {query && (
          <button
            className={styles.clearBtn}
            onClick={handleClear}
            type="button"
            aria-label="Clear search"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      {open && (
        <div className={styles.dropdown} role="listbox">
          {dataLoading && (
            <div className={styles.loadingRow}>
              <span className="material-symbols-outlined">hourglass_top</span>
              Loading data…
            </div>
          )}

          {!dataLoading && isEmpty && (
            <div className={styles.emptyRow}>
              <span className="material-symbols-outlined">search_off</span>
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {!dataLoading && Object.entries(grouped).map(([category, items]) => {
            const meta = CATEGORY_META[category] || { icon: "label", color: "#6b7280" };
            return (
              <div key={category} className={styles.group}>
                <div className={styles.groupHeader}>
                  <span
                    className={`material-symbols-outlined ${styles.groupIcon}`}
                    style={{ color: meta.color }}
                  >
                    {meta.icon}
                  </span>
                  <span className={styles.groupLabel}>{category}</span>
                  <span className={styles.groupCount}>{items.length}</span>
                </div>
                {items.map((item, idx) => (
                  <button
                    key={idx}
                    className={styles.resultItem}
                    onClick={() => handleSelect(item.path)}
                    role="option"
                    type="button"
                  >
                    <div className={styles.resultMain}>
                      <span className={styles.resultLabel}>{item.label}</span>
                      {item.sublabel && (
                        <span className={styles.resultSublabel}>{item.sublabel}</span>
                      )}
                    </div>
                    <span className={`material-symbols-outlined ${styles.resultArrow}`}>
                      chevron_right
                    </span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminGlobalSearch;

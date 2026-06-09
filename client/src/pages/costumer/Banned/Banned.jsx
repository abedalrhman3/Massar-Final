import { useNavigate } from "react-router-dom";

const Banned = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.iconWrapper}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={styles.icon}
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                </div>

                <h1 style={styles.title}>Account Banned</h1>
                <p style={styles.description}>
                    Your account has been suspended and you no longer have access to this application.
                    If you believe this is a mistake, please contact support.
                </p>

                <button
                    style={styles.button}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor;
                        e.currentTarget.style.borderColor = styles.buttonHover.borderColor;
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = styles.button.backgroundColor;
                        e.currentTarget.style.borderColor = styles.button.borderColor;
                    }}
                    onClick={() => navigate("/login")}
                >
                    ← Back to Login
                </button>

                <p style={styles.supportText}>
                    Need help?{" "}
                    <span
                        style={styles.supportLink}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                        onClick={() => navigate("/support")}
                    >
                        Contact support
                    </span>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9f9f8",
        padding: "1rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
    },
    card: {
        backgroundColor: "#ffffff",
        border: "0.5px solid rgba(0,0,0,0.15)",
        borderRadius: "12px",
        padding: "2.5rem 2rem",
        maxWidth: "420px",
        width: "100%",
        textAlign: "center",
    },
    iconWrapper: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "72px",
        height: "72px",
        borderRadius: "50%",
        backgroundColor: "#FCEBEB",
        marginBottom: "1.25rem",
    },
    icon: {
        color: "#A32D2D",
    },
    title: {
        fontSize: "22px",
        fontWeight: 500,
        color: "#1a1a1a",
        margin: "0 0 0.75rem",
    },
    description: {
        fontSize: "15px",
        color: "#666",
        lineHeight: "1.7",
        margin: "0 0 2rem",
    },
    button: {
        display: "inline-block",
        padding: "10px 20px",
        fontSize: "14px",
        fontWeight: 500,
        color: "#1a1a1a",
        backgroundColor: "transparent",
        border: "0.5px solid rgba(0,0,0,0.3)",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "background-color 0.15s, border-color 0.15s",
    },
    buttonHover: {
        backgroundColor: "#f1efea",
        borderColor: "rgba(0,0,0,0.4)",
    },
};

export default Banned;
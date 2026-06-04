import { Component } from "react";
import "./ErrorBoundary.css";


/**
 * ErrorBoundary
 *
 * Props:
 *  - message  {string}    — custom error message shown in the fallback
 *  - size     {string}    — "small" renders the skeleton error card instead of the full-page fallback
 *  - fallback {function}  — (error, reset) => JSX — fully custom fallback, overrides everything
 *  - children {ReactNode}
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Replace with your logging service (e.g. Sentry) when ready
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // 1. Fully custom fallback
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // 2. Small / card-level fallback — uses a simple fallback card
      if (this.props.size === "small") {
        return (
          <div className="eb-small-error" style={{ padding: "12px", border: "1px solid red", borderRadius: "8px", background: "#fff5f5", color: "#c92a2a" }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: "6px" }}></i>
            <span style={{ fontSize: "13px" }}>{this.props.message || "Failed to load"}</span>
            <button onClick={this.handleReset} style={{ marginLeft: "8px", padding: "2px 6px", border: "1px solid #c92a2a", borderRadius: "4px", background: "white", cursor: "pointer", fontSize: "11px" }}>Retry</button>
          </div>
        );
      }

      // 3. Default — full-page fallback card
      return (
        <div className="eb-wrapper">
          <div className="eb-card">
            <div className="eb-icon">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h1 className="eb-title">Something went wrong</h1>
            <p className="eb-message">
              {this.props.message ||
                "An unexpected error occurred. Please try again or return home."}
            </p>
            <div className="eb-actions">
              <button className="eb-btn eb-btn-primary" onClick={this.handleReset}>
                Try again
              </button>
              <a className="eb-btn eb-btn-secondary" href="/">
                Go home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
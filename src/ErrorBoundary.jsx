import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "#1B2A4A",
          color: "#F5F5F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Calibri, sans-serif",
          padding: "2rem",
        }}>
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <h1 style={{ color: "#D4A843", marginBottom: "1rem", fontSize: "1.5rem" }}>
              Ein Fehler ist aufgetreten
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem" }}>
              Bitte laden Sie die Seite neu.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "linear-gradient(135deg, #D4A843, #E8C97A)",
                color: "#1B2A4A",
                border: "none",
                borderRadius: "8px",
                padding: "0.7rem 1.5rem",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Seite neu laden
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

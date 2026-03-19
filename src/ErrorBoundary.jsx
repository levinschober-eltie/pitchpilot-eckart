import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    const isChunkError = error?.message &&
      /chunk|dynamically imported|Failed to fetch/i.test(error.message);
    if (isChunkError && !sessionStorage.getItem("eb-retry")) {
      sessionStorage.setItem("eb-retry", "1");
      window.location.reload();
    }
  }

  render() {
    if (this.state.error) {
      const isChunkError = this.state.error?.message &&
        /chunk|dynamically imported|Failed to fetch/i.test(this.state.error.message);

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
              {isChunkError ? "Aktualisierung verfügbar" : "Ein Fehler ist aufgetreten"}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem" }}>
              {isChunkError
                ? "Eine neue Version ist verfügbar. Die Seite wird automatisch aktualisiert."
                : "Bitte laden Sie die Seite neu."}
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

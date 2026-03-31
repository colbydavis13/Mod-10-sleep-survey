import { Link } from "wouter";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <div className="page-wrapper">
      <main className="main-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="home-card" style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: 800, color: "var(--accent)", margin: "0 0 0.5rem" }}>404</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Page not found.</p>
          <Link href="/" className="btn-primary">Go Home</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

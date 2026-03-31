import { Link } from "wouter";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <div className="page-wrapper">
      <main className="main-content">
        <div className="home-card">
          <h1 className="home-title">Sleep Habits Survey</h1>
          <p className="home-subtitle">
            Help us understand how undergraduate business students sleep. This short survey collects
            anonymous information about your sleep quality and nightly habits.
          </p>
          <p className="home-note">
            The survey takes about 2 minutes to complete. Your responses are aggregated — no individual
            answers are ever displayed.
          </p>
          <div className="home-buttons">
            <Link href="/survey" className="btn-primary">
              Take the Survey
            </Link>
            <Link href="/results" className="btn-secondary">
              View Results
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

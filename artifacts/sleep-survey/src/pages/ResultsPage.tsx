import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { supabase } from "../lib/supabase";
import Footer from "../components/Footer";
import type { SurveyResponse } from "../types/survey";

const ACCENT = "#8A3BDB";

const QUALITY_ORDER = ["Excellent", "Good", "Fair", "Poor", "Terrible"];
const STANDARD_HABITS = [
  "Melatonin/other sleep supplements",
  "Reading a book",
  "Watching TV or doomscrolling on your phone",
  "Breathing exercises/meditation",
  "White noise/sleep sounds",
];

interface ChartEntry {
  name: string;
  count: number;
}

interface TimeEntry {
  name: string;
  count: number;
  pct: string;
}

function buildQualityData(responses: SurveyResponse[]): ChartEntry[] {
  const counts: Record<string, number> = {};
  for (const r of responses) {
    counts[r.sleep_quality] = (counts[r.sleep_quality] ?? 0) + 1;
  }
  return QUALITY_ORDER
    .map((q) => ({ name: q, count: counts[q] ?? 0 }))
    .sort((a, b) => {
      if (a.count !== b.count) return a.count - b.count;
      return QUALITY_ORDER.indexOf(a.name) - QUALITY_ORDER.indexOf(b.name);
    });
}

function buildHabitsData(responses: SurveyResponse[]): ChartEntry[] {
  const counts: Record<string, number> = {};

  for (const r of responses) {
    for (const habit of r.sleep_habits) {
      if (habit === "Other") {
        if (r.other_sleep_habits && r.other_sleep_habits.trim()) {
          const normalized = r.other_sleep_habits.trim().toLowerCase();
          counts[normalized] = (counts[normalized] ?? 0) + 1;
        }
      } else {
        counts[habit] = (counts[habit] ?? 0) + 1;
      }
    }
  }

  const displayNames: Record<string, string> = {};
  for (const habit of STANDARD_HABITS) {
    displayNames[habit] = habit;
  }
  for (const r of responses) {
    if (r.other_sleep_habits && r.other_sleep_habits.trim()) {
      const normalized = r.other_sleep_habits.trim().toLowerCase();
      if (!displayNames[normalized]) {
        displayNames[normalized] = r.other_sleep_habits.trim();
      }
    }
  }

  return Object.entries(counts)
    .map(([key, count]) => ({ name: displayNames[key] ?? key, count }))
    .sort((a, b) => b.count - a.count);
}

function buildSleepTimeData(responses: SurveyResponse[]): TimeEntry[] {
  const counts: Record<string, number> = {};
  for (const r of responses) {
    counts[r.sleep_time] = (counts[r.sleep_time] ?? 0) + 1;
  }
  const total = responses.length;
  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      pct: total > 0 ? `${Math.round((count / total) * 100)}%` : "0%",
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

function truncateLabel(label: string, maxLen = 30): string {
  return label.length > maxLen ? label.slice(0, maxLen) + "…" : label;
}

export default function ResultsPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("survey_responses")
        .select("*");
      if (error) {
        setError("Failed to load results. Please try again later.");
      } else {
        setResponses(data as SurveyResponse[]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const qualityData = buildQualityData(responses);
  const habitsData = buildHabitsData(responses);
  const sleepTimeData = buildSleepTimeData(responses);

  return (
    <div className="page-wrapper">
      <header className="survey-header">
        <h1 className="survey-header-title">Survey Results</h1>
        <Link href="/" className="btn-outline">
          Home
        </Link>
      </header>

      <main className="main-content results-content">
        {loading && (
          <div className="loading-state" aria-live="polite" aria-busy="true">
            Loading results…
          </div>
        )}

        {error && (
          <div className="submit-error" role="alert">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="total-responses" aria-label={`Total responses: ${responses.length}`}>
              <span className="total-number">{responses.length}</span>
              <span className="total-label">Total {responses.length === 1 ? "Response" : "Responses"}</span>
            </div>

            {responses.length === 0 ? (
              <p className="no-data">No responses yet. Be the first to take the survey!</p>
            ) : (
              <>
                {/* Chart 1: Sleep Quality */}
                <section className="chart-section" aria-labelledby="chart-quality-heading">
                  <h2 id="chart-quality-heading" className="chart-title">
                    Sleep Quality Ratings
                  </h2>
                  <p className="chart-subtitle">Ordered from least common to most common</p>
                  <div className="chart-container" style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={qualityData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fill: "#1a1a1a", fontSize: 13 }} />
                        <YAxis allowDecimals={false} tick={{ fill: "#1a1a1a", fontSize: 13 }} />
                        <Tooltip
                          contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }}
                          formatter={(val: number) => [`${val} response${val !== 1 ? "s" : ""}`, "Count"]}
                        />
                        <Bar dataKey="count" fill={ACCENT} radius={[4, 4, 0, 0]}>
                          <LabelList dataKey="count" position="top" style={{ fill: "#1a1a1a", fontSize: 13 }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* Chart 2: Sleep Habits */}
                <section className="chart-section" aria-labelledby="chart-habits-heading">
                  <h2 id="chart-habits-heading" className="chart-title">
                    Most Popular Sleep Habits
                  </h2>
                  <p className="chart-subtitle">Sorted by frequency (user-entered habits shown individually)</p>
                  <div className="chart-container" style={{ height: Math.max(250, habitsData.length * 52 + 40) }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={habitsData}
                        layout="vertical"
                        margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} tick={{ fill: "#1a1a1a", fontSize: 13 }} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={200}
                          tick={{ fill: "#1a1a1a", fontSize: 12 }}
                          tickFormatter={(v: string) => truncateLabel(v, 28)}
                        />
                        <Tooltip
                          contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }}
                          formatter={(val: number) => [`${val} response${val !== 1 ? "s" : ""}`, "Count"]}
                          labelFormatter={(label: string) => label}
                        />
                        <Bar dataKey="count" fill={ACCENT} radius={[0, 4, 4, 0]}>
                          <LabelList dataKey="count" position="right" style={{ fill: "#1a1a1a", fontSize: 13 }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* Chart 3: Sleep Time */}
                <section className="chart-section" aria-labelledby="chart-time-heading">
                  <h2 id="chart-time-heading" className="chart-title">
                    Top Sleep Times
                  </h2>
                  <p className="chart-subtitle">Top 3 most common weeknight sleep times</p>
                  <div className="chart-container" style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sleepTimeData}
                        layout="vertical"
                        margin={{ top: 5, right: 80, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} tick={{ fill: "#1a1a1a", fontSize: 13 }} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={140}
                          tick={{ fill: "#1a1a1a", fontSize: 13 }}
                        />
                        <Tooltip
                          contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }}
                          formatter={(val: number, _: string, entry: { payload?: TimeEntry }) => [
                            `${val} response${val !== 1 ? "s" : ""} (${entry.payload?.pct ?? ""})`,
                            "Count",
                          ]}
                        />
                        <Bar dataKey="count" fill={ACCENT} radius={[0, 4, 4, 0]}>
                          <LabelList
                            dataKey="pct"
                            position="right"
                            style={{ fill: "#1a1a1a", fontSize: 13 }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import Footer from "../components/Footer";
import {
  SLEEP_QUALITY_OPTIONS,
  SLEEP_HABIT_OPTIONS,
  SLEEP_TIME_OPTIONS,
  type SleepQuality,
  type SleepHabit,
  type SurveyFormData,
} from "../types/survey";

interface FormErrors {
  sleepQuality?: string;
  sleepTime?: string;
  sleepHabits?: string;
  otherSleepHabit?: string;
  negativeImpact?: string;
}

interface SubmittedAnswers {
  sleepQuality: string;
  sleepTime: string;
  sleepHabits: string[];
  otherSleepHabit: string;
  negativeImpact: string;
}

export default function SurveyPage() {
  const [form, setForm] = useState<SurveyFormData>({
    sleepQuality: "",
    sleepTime: "",
    sleepHabits: [],
    otherSleepHabit: "",
    negativeImpact: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState<SubmittedAnswers | null>(null);

  const otherInputRef = useRef<HTMLInputElement>(null);
  const negativeImpactRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (negativeImpactRef.current) {
      negativeImpactRef.current.focus();
    }
  }, []);

  const otherChecked = form.sleepHabits.includes("Other");

  useEffect(() => {
    if (otherChecked && otherInputRef.current) {
      otherInputRef.current.focus();
    }
  }, [otherChecked]);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.sleepQuality) e.sleepQuality = "Please select a sleep quality rating.";
    if (!form.sleepTime) e.sleepTime = "Please select a typical sleep time.";
    if (form.sleepHabits.length === 0) e.sleepHabits = "Please select at least one sleep habit.";
    if (otherChecked && !form.otherSleepHabit.trim())
      e.otherSleepHabit = "Please describe your other sleep technique.";
    if (!form.negativeImpact.trim())
      e.negativeImpact = "Please describe what most negatively impacts your sleep quality.";
    return e;
  }

  function handleQualityChange(value: SleepQuality) {
    setForm((f) => ({ ...f, sleepQuality: value }));
    if (errors.sleepQuality) setErrors((e) => ({ ...e, sleepQuality: undefined }));
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setForm((f) => ({ ...f, sleepTime: e.target.value }));
    if (errors.sleepTime) setErrors((prev) => ({ ...prev, sleepTime: undefined }));
  }

  function handleHabitChange(habit: SleepHabit, checked: boolean) {
    setForm((f) => ({
      ...f,
      sleepHabits: checked
        ? [...f.sleepHabits, habit]
        : f.sleepHabits.filter((h) => h !== habit),
      otherSleepHabit: !checked && habit === "Other" ? "" : f.otherSleepHabit,
    }));
    if (errors.sleepHabits) setErrors((e) => ({ ...e, sleepHabits: undefined }));
    if (habit === "Other" && !checked) setErrors((e) => ({ ...e, otherSleepHabit: undefined }));
  }

  function handleOtherHabitChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, otherSleepHabit: e.target.value }));
    if (errors.otherSleepHabit) setErrors((prev) => ({ ...prev, otherSleepHabit: undefined }));
  }

  function handleNegativeImpactChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, negativeImpact: e.target.value }));
    if (errors.negativeImpact) setErrors((prev) => ({ ...prev, negativeImpact: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorKey = Object.keys(validationErrors)[0];
      const el = document.getElementById(`error-${firstErrorKey}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from("survey_responses").insert({
      sleep_quality: form.sleepQuality,
      sleep_time: form.sleepTime,
      sleep_habits: form.sleepHabits,
      other_sleep_habits: otherChecked && form.otherSleepHabit.trim() ? form.otherSleepHabit.trim() : null,
      negative_impact: form.negativeImpact.trim(),
    });

    setSubmitting(false);

    if (error) {
      setSubmitError("Something went wrong saving your response. Please try again.");
      return;
    }

    setSubmittedAnswers({
      sleepQuality: form.sleepQuality,
      sleepTime: form.sleepTime,
      sleepHabits: form.sleepHabits,
      otherSleepHabit: form.otherSleepHabit,
      negativeImpact: form.negativeImpact,
    });
    setSubmitted(true);
  }

  if (submitted && submittedAnswers) {
    return (
      <div className="page-wrapper">
        <main className="main-content">
          <div className="survey-card">
            <div className="thankyou-icon" aria-hidden="true">✓</div>
            <h1 className="thankyou-title">Thank you!</h1>
            <p className="thankyou-subtitle">Your response has been recorded.</p>

            <div className="summary-box">
              <h2 className="summary-heading">Your answers</h2>
              <dl className="summary-list">
                <div className="summary-item">
                  <dt className="summary-label">Sleep quality</dt>
                  <dd className="summary-value">{submittedAnswers.sleepQuality}</dd>
                </div>
                <div className="summary-item">
                  <dt className="summary-label">Typical sleep time</dt>
                  <dd className="summary-value">{submittedAnswers.sleepTime}</dd>
                </div>
                <div className="summary-item">
                  <dt className="summary-label">Sleep habits</dt>
                  <dd className="summary-value">
                    {submittedAnswers.sleepHabits
                      .map((h) => (h === "Other" && submittedAnswers.otherSleepHabit ? submittedAnswers.otherSleepHabit : h))
                      .join(", ")}
                  </dd>
                </div>
                <div className="summary-item">
                  <dt className="summary-label">Most negative impact on sleep</dt>
                  <dd className="summary-value">{submittedAnswers.negativeImpact}</dd>
                </div>
              </dl>
            </div>

            <div className="thankyou-buttons">
              <Link href="/results" className="btn-primary">
                View Results
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <header className="survey-header">
        <h1 className="survey-header-title">Sleep Habits Survey</h1>
        <Link href="/results" className="header-link">
          View Results
        </Link>
      </header>

      <main className="main-content">
        <div className="survey-card">
          <form onSubmit={handleSubmit} noValidate aria-label="Sleep habits survey">

            {/* Q1 — Sleep Quality */}
            <fieldset className="form-fieldset" aria-describedby={errors.sleepQuality ? "error-sleepQuality" : undefined}>
              <legend className="form-legend">
                How would you rate your overall sleep quality?
                <span className="required-indicator" aria-label="required"> *</span>
              </legend>
              <div className="radio-group">
                {SLEEP_QUALITY_OPTIONS.map((opt) => (
                  <label key={opt.value} className="radio-label">
                    <input
                      type="radio"
                      name="sleepQuality"
                      value={opt.value}
                      checked={form.sleepQuality === opt.value}
                      onChange={() => handleQualityChange(opt.value)}
                      className="radio-input"
                      aria-describedby={errors.sleepQuality ? "error-sleepQuality" : undefined}
                    />
                    <span className="radio-text">
                      <span className="radio-option-label">{opt.label}</span>
                      <span className="radio-sublabel">"{opt.sublabel}"</span>
                    </span>
                  </label>
                ))}
              </div>
              {errors.sleepQuality && (
                <p id="error-sleepQuality" className="field-error" role="alert">
                  {errors.sleepQuality}
                </p>
              )}
            </fieldset>

            {/* Q2 — Sleep Time */}
            <div className="form-field">
              <label htmlFor="sleepTime" className="form-label">
                What time do you typically fall asleep on weeknights?
                <span className="required-indicator" aria-label="required"> *</span>
              </label>
              <select
                id="sleepTime"
                value={form.sleepTime}
                onChange={handleTimeChange}
                className={`form-select${errors.sleepTime ? " field-input-error" : ""}`}
                aria-describedby={errors.sleepTime ? "error-sleepTime" : undefined}
                aria-required="true"
              >
                <option value="">— Select a time —</option>
                {SLEEP_TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.sleepTime && (
                <p id="error-sleepTime" className="field-error" role="alert">
                  {errors.sleepTime}
                </p>
              )}
            </div>

            {/* Q3 — Sleep Habits */}
            <fieldset className="form-fieldset" aria-describedby={errors.sleepHabits ? "error-sleepHabits" : undefined}>
              <legend className="form-legend">
                Which of the following do you do/use to fall asleep?
                <span className="required-indicator" aria-label="required"> *</span>
              </legend>
              <div className="checkbox-group">
                {SLEEP_HABIT_OPTIONS.map((habit) => (
                  <div key={habit}>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.sleepHabits.includes(habit)}
                        onChange={(e) => handleHabitChange(habit, e.target.checked)}
                        className="checkbox-input"
                        aria-describedby={errors.sleepHabits ? "error-sleepHabits" : undefined}
                      />
                      <span className="checkbox-text">{habit}</span>
                    </label>
                    {habit === "Other" && otherChecked && (
                      <div className="other-input-wrapper">
                        <label htmlFor="otherSleepHabit" className="other-label">
                          Please describe your other sleep technique:
                          <span className="required-indicator" aria-label="required"> *</span>
                        </label>
                        <input
                          ref={otherInputRef}
                          id="otherSleepHabit"
                          type="text"
                          value={form.otherSleepHabit}
                          onChange={handleOtherHabitChange}
                          placeholder="e.g. Stretching, journaling..."
                          className={`form-input${errors.otherSleepHabit ? " field-input-error" : ""}`}
                          aria-describedby={errors.otherSleepHabit ? "error-otherSleepHabit" : undefined}
                          aria-required="true"
                        />
                        {errors.otherSleepHabit && (
                          <p id="error-otherSleepHabit" className="field-error" role="alert">
                            {errors.otherSleepHabit}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {errors.sleepHabits && (
                <p id="error-sleepHabits" className="field-error" role="alert">
                  {errors.sleepHabits}
                </p>
              )}
            </fieldset>

            {/* Q4 — Negative Impact */}
            <div className="form-field">
              <label htmlFor="negativeImpact" className="form-label">
                Describe in your own words what you believe most negatively impacts your sleep quality?
                <span className="required-indicator" aria-label="required"> *</span>
              </label>
              <textarea
                ref={negativeImpactRef}
                id="negativeImpact"
                value={form.negativeImpact}
                onChange={handleNegativeImpactChange}
                placeholder="e.g. Stress, late-night screen time..."
                rows={4}
                className={`form-textarea${errors.negativeImpact ? " field-input-error" : ""}`}
                aria-describedby={errors.negativeImpact ? "error-negativeImpact" : undefined}
                aria-required="true"
              />
              {errors.negativeImpact && (
                <p id="error-negativeImpact" className="field-error" role="alert">
                  {errors.negativeImpact}
                </p>
              )}
            </div>

            {submitError && (
              <div className="submit-error" role="alert">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary btn-submit"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? "Submitting..." : "Submit Survey"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export type SleepQuality = "Excellent" | "Good" | "Fair" | "Poor" | "Terrible";

export type SleepHabit =
  | "Melatonin/other sleep supplements"
  | "Reading a book"
  | "Watching TV or doomscrolling on your phone"
  | "Breathing exercises/meditation"
  | "White noise/sleep sounds"
  | "Other";

export interface SurveyFormData {
  sleepQuality: SleepQuality | "";
  sleepTime: string;
  sleepHabits: SleepHabit[];
  otherSleepHabit: string;
  negativeImpact: string;
}

export interface SurveyResponse {
  id: string;
  created_at: string;
  sleep_quality: string;
  sleep_time: string;
  sleep_habits: string[];
  other_sleep_habits: string | null;
  negative_impact: string;
}

export type Database = {
  public: {
    Tables: {
      survey_responses: {
        Row: SurveyResponse;
        Insert: Omit<SurveyResponse, "id" | "created_at">;
        Update: Partial<Omit<SurveyResponse, "id" | "created_at">>;
      };
    };
  };
};

export const SLEEP_QUALITY_OPTIONS: { value: SleepQuality; label: string; sublabel: string }[] = [
  { value: "Excellent", label: "Excellent", sublabel: "I wake up feeling fully rested!" },
  { value: "Good", label: "Good", sublabel: "I usually feel okay" },
  { value: "Fair", label: "Fair", sublabel: "I often feel somewhat rested" },
  { value: "Poor", label: "Poor", sublabel: "I rarely feel rested" },
  { value: "Terrible", label: "Terrible", sublabel: "I never feel rested" },
];

export const SLEEP_HABIT_OPTIONS: SleepHabit[] = [
  "Melatonin/other sleep supplements",
  "Reading a book",
  "Watching TV or doomscrolling on your phone",
  "Breathing exercises/meditation",
  "White noise/sleep sounds",
  "Other",
];

export const SLEEP_TIME_OPTIONS: string[] = [
  "Before 8:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
  "11:00 PM",
  "12:00 AM",
  "1:00 AM",
  "After 1:00 AM",
];

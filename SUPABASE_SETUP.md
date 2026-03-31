# Supabase Database Setup

Run the following SQL in your Supabase project's **SQL Editor** (under the Database section in the Supabase dashboard).

## Step 1: Create the table

```sql
CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  sleep_quality text NOT NULL,
  sleep_time text NOT NULL,
  sleep_habits text[] NOT NULL,
  other_sleep_habits text,
  negative_impact text NOT NULL
);
```

## Step 2: Enable Row Level Security

```sql
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
```

## Step 3: Create RLS policies for anonymous access

Allow any anonymous visitor to submit a response:

```sql
CREATE POLICY "Allow anonymous insert"
  ON survey_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);
```

Allow the results page to read aggregated data:

```sql
CREATE POLICY "Allow anonymous select"
  ON survey_responses
  FOR SELECT
  TO anon
  USING (true);
```

## Environment Variables

Make sure the following are set in your environment (both locally and in GitHub Actions secrets):

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://ckgovtjbfwebrldojqps.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your anon/public key from Supabase → Project Settings → API |

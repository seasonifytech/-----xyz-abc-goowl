/*
  # Add Progress Tracking

  1. New Tables
    - `progress` table to track answered questions per anonymous client
      - `client_id` (text, primary key) - UUID from localStorage
      - `answered_questions` (text array) - Array of answered question IDs
      - `created_at` (timestamptz) - When the client first started
      - `updated_at` (timestamptz) - Last time progress was updated

  2. Security
    - Enable RLS on `progress` table
    - Add policy for public access (no auth required)
*/

-- Create progress table
CREATE TABLE IF NOT EXISTS public.progress (
  client_id text PRIMARY KEY,
  answered_questions text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Add policies for public access
CREATE POLICY "Allow public read access to progress"
  ON public.progress
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert/update to progress"
  ON public.progress
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to automatically update updated_at
CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON public.progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
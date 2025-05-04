/*
  # Add Feedback Ratings System

  1. New Tables
    - `feedback_ratings` table to track user feedback on the feedback system
      - `id` (uuid, primary key)
      - `feedback_log_id` (uuid, foreign key to feedback_logs)
      - `helpful` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `feedback_ratings` table
    - Add policies for public access
*/

-- Create feedback_ratings table
CREATE TABLE IF NOT EXISTS public.feedback_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_log_id uuid REFERENCES public.feedback_logs(id) ON DELETE CASCADE,
  helpful boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS feedback_ratings_feedback_log_id_idx ON public.feedback_ratings(feedback_log_id);

-- Enable RLS
ALTER TABLE public.feedback_ratings ENABLE ROW LEVEL SECURITY;

-- Add policies for public access
CREATE POLICY "Feedback ratings are readable by all"
  ON public.feedback_ratings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create feedback ratings"
  ON public.feedback_ratings
  FOR INSERT
  TO public
  WITH CHECK (true);
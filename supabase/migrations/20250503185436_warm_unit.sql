/*
  # Add Feedback Logs Table

  1. New Tables
    - `feedback_logs` table for tracking feedback generation attempts
      - `id` (uuid, primary key)
      - `request_data` (jsonb) - The request payload
      - `response_data` (jsonb) - The response data
      - `error` (text) - Error message if any
      - `source` (text) - Where the feedback came from (edge/api/local)
      - `created_at` (timestamptz) - When the log was created
      - `success` (boolean) - Whether the feedback generation was successful

  2. Security
    - Enable RLS on `feedback_logs` table
    - Add policy for public access (no auth required)
*/

-- Create feedback_logs table
CREATE TABLE IF NOT EXISTS public.feedback_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_data jsonb NOT NULL,
  response_data jsonb,
  error text,
  source text NOT NULL,
  created_at timestamptz DEFAULT now(),
  success boolean NOT NULL DEFAULT false,
  
  -- Add constraint to ensure source is valid
  CONSTRAINT valid_source CHECK (source IN ('edge', 'api', 'local'))
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS feedback_logs_created_at_idx ON public.feedback_logs(created_at);
CREATE INDEX IF NOT EXISTS feedback_logs_success_idx ON public.feedback_logs(success);

-- Enable RLS
ALTER TABLE public.feedback_logs ENABLE ROW LEVEL SECURITY;

-- Add policies for public access
CREATE POLICY "Feedback logs are readable by all"
  ON public.feedback_logs
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create feedback logs"
  ON public.feedback_logs
  FOR INSERT
  TO public
  WITH CHECK (true);
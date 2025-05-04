/*
  # Add Community Answers and View Tracking

  1. New Tables
    - `community_answers` table for storing public answers
      - `id` (uuid, primary key)
      - `question_id` (uuid, foreign key to interview_questions)
      - `answer` (text)
      - `created_at` (timestamptz)
      - `upvotes` (integer)

  2. Modifications
    - Add `views` column to `interview_questions` table
    - Add `answer_count` column to `interview_questions` table

  3. Security
    - Enable RLS on `community_answers` table
    - Add policies for public read access and anonymous write access
*/

-- Add views and answer_count columns to interview_questions
ALTER TABLE public.interview_questions 
ADD COLUMN IF NOT EXISTS views integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS answer_count integer DEFAULT 0;

-- Create community_answers table
CREATE TABLE IF NOT EXISTS public.community_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES public.interview_questions(id) ON DELETE CASCADE,
  answer text NOT NULL,
  created_at timestamptz DEFAULT now(),
  upvotes integer DEFAULT 0,
  
  -- Add constraint to ensure answer is not empty
  CONSTRAINT answer_not_empty CHECK (length(trim(answer)) > 0)
);

-- Create index for faster lookups by question_id
CREATE INDEX IF NOT EXISTS community_answers_question_id_idx ON public.community_answers(question_id);

-- Enable RLS
ALTER TABLE public.community_answers ENABLE ROW LEVEL SECURITY;

-- Add policies for public access
CREATE POLICY "Community answers are readable by all"
  ON public.community_answers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create community answers"
  ON public.community_answers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Function to update answer_count
CREATE OR REPLACE FUNCTION update_question_answer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.interview_questions 
    SET answer_count = answer_count + 1
    WHERE id = NEW.question_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.interview_questions 
    SET answer_count = answer_count - 1
    WHERE id = OLD.question_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain answer_count
CREATE TRIGGER update_answer_count
  AFTER INSERT OR DELETE ON public.community_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_question_answer_count();
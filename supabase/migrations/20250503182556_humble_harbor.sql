/*
  # Add Increment Functions

  1. New Functions
    - `increment_views`: Safely increment the views counter for a question
    - `increment`: Generic increment function for counters
*/

-- Function to increment views
CREATE OR REPLACE FUNCTION increment_views(question_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.interview_questions
  SET views = COALESCE(views, 0) + 1
  WHERE id = question_id;
END;
$$ LANGUAGE plpgsql;

-- Generic increment function
CREATE OR REPLACE FUNCTION increment()
RETURNS integer AS $$
BEGIN
  RETURN COALESCE(NEW.upvotes, 0) + 1;
END;
$$ LANGUAGE plpgsql;
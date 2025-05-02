/*
  # Update RLS policies for interview_questions

  This migration modifies the existing RLS policies to allow anonymous read access
  while maintaining authenticated-only write access.

  1. Security
    - Update policy to allow anyone to read interview questions
    - Keep write operations restricted to authenticated users only

  The changes ensure that the application can access question data without requiring
  authentication, which addresses the data loading issues.
*/

-- First revoke the existing SELECT policy
DROP POLICY IF EXISTS "Questions can be read by authenticated users" ON public.interview_questions;

-- Create a new policy that allows public read access
CREATE POLICY "Questions can be read by anyone" 
  ON public.interview_questions
  FOR SELECT
  TO public
  USING (true);

-- Keep the existing INSERT policy which requires authentication
-- (no changes needed to the INSERT policy)
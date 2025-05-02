/*
  # Add mock interview questions

  1. New Data
    - Add sample interview questions to the `interview_questions` table
    - Include questions for different companies, categories, and difficulty levels
*/

-- Add sample interview questions
INSERT INTO public.interview_questions (question, category, difficulty, job_role, company)
VALUES
  ('Tell me about a time you had to deal with a difficult team member', 'Behavioral', 'medium', 'Software Engineering', 'Google'),
  ('Design a parking lot system', 'System Design', 'hard', 'Software Engineering', 'Google'),
  ('Describe a time when you had to make a decision with limited information', 'Behavioral', 'medium', 'Product Management', 'Apple'),
  ('How would you improve our product?', 'Product', 'medium', 'Product Management', 'Apple'),
  ('Tell me about a project that failed and what you learned', 'Behavioral', 'easy', 'Software Engineering', 'Microsoft'),
  ('How would you design Twitter''s backend?', 'System Design', 'hard', 'Software Engineering', 'Microsoft'),
  ('Tell me about a time you had to persuade others to adopt your idea', 'Behavioral', 'medium', 'Product Management', 'Amazon'),
  ('How would you design Amazon''s recommendation system?', 'System Design', 'hard', 'Data Science', 'Amazon'),
  ('Tell me about your most successful project', 'Behavioral', 'easy', 'Software Engineering', 'Meta'),
  ('How would you design Instagram''s feed algorithm?', 'System Design', 'hard', 'Data Science', 'Meta'),
  ('Tell me about a time you had to prioritize features', 'Behavioral', 'medium', 'Product Management', 'Netflix'),
  ('How would you design Netflix''s recommendation engine?', 'System Design', 'hard', 'Data Science', 'Netflix'),
  ('What is your approach to debugging a complex issue?', 'Technical', 'medium', 'Software Engineering', 'Google'),
  ('How do you handle tight deadlines?', 'Behavioral', 'easy', 'Project Management', 'Apple'),
  ('Design an elevator system', 'System Design', 'hard', 'Software Engineering', 'Amazon'),
  ('How would you improve our current user onboarding?', 'Product', 'medium', 'Product Management', 'Meta'),
  ('Tell me about a time you had to learn a new technology quickly', 'Behavioral', 'easy', 'Software Engineering', 'Microsoft'),
  ('Design a URL shortening service', 'System Design', 'medium', 'Software Engineering', 'Google'),
  ('How would you measure the success of a feature launch?', 'Product', 'medium', 'Product Management', 'Netflix'),
  ('Tell me about a time you had to make a trade-off between quality and speed', 'Behavioral', 'medium', 'Software Engineering', 'Amazon')
ON CONFLICT DO NOTHING;
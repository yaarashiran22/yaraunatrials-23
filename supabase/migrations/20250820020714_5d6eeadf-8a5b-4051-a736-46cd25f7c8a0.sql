-- Allow anonymous neighbor questions by making user_id nullable and adding is_anonymous field
ALTER TABLE neighbor_questions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE neighbor_questions ADD COLUMN is_anonymous boolean DEFAULT false;

-- Update RLS policies to allow anonymous question creation
DROP POLICY "Users can create neighbor questions" ON neighbor_questions;
CREATE POLICY "Users can create neighbor questions" 
ON neighbor_questions 
FOR INSERT 
WITH CHECK (
  (auth.uid() = user_id) OR 
  (user_id IS NULL AND is_anonymous = true)
);
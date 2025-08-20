-- Add message_type column to neighbor_questions table
ALTER TABLE public.neighbor_questions 
ADD COLUMN message_type text DEFAULT 'inquiry'::text;

-- Add a check constraint to ensure valid message types
ALTER TABLE public.neighbor_questions 
ADD CONSTRAINT neighbor_questions_message_type_check 
CHECK (message_type IN ('alert', 'inquiry', 'help'));

-- Add a comment to document the message types
COMMENT ON COLUMN public.neighbor_questions.message_type IS 'Type of message: alert (התראה), inquiry (בירור), help (צריך עזרה)';
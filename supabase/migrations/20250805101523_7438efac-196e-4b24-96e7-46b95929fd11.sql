-- Ensure the neighbor_question_comments table exists with proper structure
-- This table should already exist but we're making sure it has the right columns

DO $$
BEGIN
  -- Check if the table exists and has the correct structure
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'neighbor_question_comments') THEN
    CREATE TABLE public.neighbor_question_comments (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      question_id UUID NOT NULL,
      user_id UUID NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );

    -- Enable Row Level Security
    ALTER TABLE public.neighbor_question_comments ENABLE ROW LEVEL SECURITY;

    -- Create policies for neighbor question comments
    CREATE POLICY "Anyone can view neighbor question comments" 
    ON public.neighbor_question_comments 
    FOR SELECT 
    USING (true);

    CREATE POLICY "Users can create neighbor question comments" 
    ON public.neighbor_question_comments 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own neighbor question comments" 
    ON public.neighbor_question_comments 
    FOR UPDATE 
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own neighbor question comments" 
    ON public.neighbor_question_comments 
    FOR DELETE 
    USING (auth.uid() = user_id);

    -- Create trigger for automatic timestamp updates
    CREATE TRIGGER update_neighbor_question_comments_updated_at
    BEFORE UPDATE ON public.neighbor_question_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
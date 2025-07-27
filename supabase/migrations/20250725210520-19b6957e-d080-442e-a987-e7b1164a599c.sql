-- Create saved_items table to track which items users have saved
CREATE TABLE public.saved_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Enable RLS
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own saved items" 
ON public.saved_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save items" 
ON public.saved_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their own items" 
ON public.saved_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX idx_saved_items_user_id ON public.saved_items(user_id);
CREATE INDEX idx_saved_items_item_id ON public.saved_items(item_id);
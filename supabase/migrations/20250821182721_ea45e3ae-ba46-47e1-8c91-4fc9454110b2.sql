-- Create notifications table to store user notifications
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  related_user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to create friend notification
CREATE OR REPLACE FUNCTION public.create_friend_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for the user being added as a friend
  INSERT INTO public.notifications (user_id, type, title, message, related_user_id)
  VALUES (
    NEW.friend_id,
    'friend_request',
    'חבר חדש!',
    'משתמש הוסיף אותך כחבר',
    NEW.user_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create notifications when users are added as friends
CREATE TRIGGER create_friend_notification_trigger
  AFTER INSERT ON public.user_friends
  FOR EACH ROW
  EXECUTE FUNCTION public.create_friend_notification();

-- Create function to update timestamps
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
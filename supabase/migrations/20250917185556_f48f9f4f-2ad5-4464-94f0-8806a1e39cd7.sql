-- Add admin role for the current user who just registered
INSERT INTO public.user_roles (user_id, role)
VALUES ('b768a6c9-6d92-45f4-b2a4-a87ff182e1fa', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
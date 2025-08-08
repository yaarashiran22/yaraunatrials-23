-- Enable pg_cron and pg_net extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to rotate daily challenge every day at midnight UTC
SELECT cron.schedule(
  'rotate-daily-challenge',
  '0 0 * * *', -- every day at midnight UTC
  $$
  SELECT
    net.http_post(
        url:='https://nnosyzgguftgrvkfqcpc.supabase.co/functions/v1/rotate-daily-challenge',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ub3N5emdndWZ0Z3J2a2ZxY3BjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDM1NzEsImV4cCI6MjA2OTAxOTU3MX0.VRcPXIQkhPGhgV2FujyLKacMuz5c4ANtcP64l0N7LbA"}'::jsonb,
        body:='{"time": "scheduled"}'::jsonb
    ) as request_id;
  $$
);
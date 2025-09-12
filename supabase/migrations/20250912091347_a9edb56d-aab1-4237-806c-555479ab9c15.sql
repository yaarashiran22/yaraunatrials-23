-- Add meetup date and time fields to items table
ALTER TABLE items 
ADD COLUMN meetup_date date,
ADD COLUMN meetup_time time without time zone;
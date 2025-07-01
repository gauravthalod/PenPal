-- Update schema to allow normal email addresses
-- Run this in your Supabase SQL Editor after the initial schema

-- Remove the college constraint to allow any college name
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_college_check;

-- Add a more flexible college field (still required but no specific values)
ALTER TABLE public.users ALTER COLUMN college SET NOT NULL;

-- Update the year constraint to be more flexible (including PG years)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_year_check;
ALTER TABLE public.users ADD CONSTRAINT users_year_check CHECK (year >= 1 AND year <= 6);

-- Update the handle_new_user function to work with any email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, college, year, branch)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'college', 'Other'),
        COALESCE((NEW.raw_user_meta_data->>'year')::INTEGER, 1),
        COALESCE(NEW.raw_user_meta_data->>'branch', 'General')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

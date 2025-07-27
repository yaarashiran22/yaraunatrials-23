-- Function to process existing profile pictures
DO $$
DECLARE
    profile_record RECORD;
    small_image_url TEXT;
BEGIN
    -- Process each profile with an image
    FOR profile_record IN 
        SELECT id, profile_image_url 
        FROM public.profiles 
        WHERE profile_image_url IS NOT NULL
    LOOP
        -- Generate small image URL based on the pattern
        small_image_url := REPLACE(profile_record.profile_image_url, '/profile.', '/small-profile.');
        small_image_url := REPLACE(small_image_url, '/profile.png', '/small-profile.jpg');
        small_image_url := REPLACE(small_image_url, '/profile.jpeg', '/small-profile.jpg');
        small_image_url := REPLACE(small_image_url, '/profile.jpg', '/small-profile.jpg');
        
        -- Insert into smallprofiles if URL was transformed
        IF small_image_url != profile_record.profile_image_url THEN
            INSERT INTO public.smallprofiles (id, photo)
            VALUES (profile_record.id, small_image_url)
            ON CONFLICT (id) DO UPDATE SET photo = EXCLUDED.photo;
        END IF;
    END LOOP;
END $$;
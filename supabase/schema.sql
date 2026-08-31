-- =========================================================
-- Airwaves — Database & Storage Setup
-- Run this in your Supabase SQL Editor (project: ihnpawujrjxchlvopbwb)
-- =========================================================

-- 1. Create the `videos` table
CREATE TABLE IF NOT EXISTS public.videos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    external_link TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    category TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    accent_color TEXT DEFAULT '#ef4444',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all playlist videos
DROP POLICY IF EXISTS "Public can view videos" ON public.videos;
CREATE POLICY "Public can view videos" 
ON public.videos FOR SELECT 
USING (true);

-- Allow authenticated admins to insert, update, and delete videos
DROP POLICY IF EXISTS "Admins can manage videos" ON public.videos;
CREATE POLICY "Admins can manage videos" 
ON public.videos FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Also allow anon write access if using client-side admin password verification
DROP POLICY IF EXISTS "Anon can manage videos with app" ON public.videos;
CREATE POLICY "Anon can manage videos with app" 
ON public.videos FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

-- Enable Realtime on the videos table
ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;

-- 2. Create the `thumbnails` storage bucket for uploaded images
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access to thumbnails bucket
DROP POLICY IF EXISTS "Public can view thumbnails" ON storage.objects;
CREATE POLICY "Public can view thumbnails" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'thumbnails');

-- Allow image uploads to thumbnails bucket
DROP POLICY IF EXISTS "Public can upload thumbnails" ON storage.objects;
CREATE POLICY "Public can upload thumbnails" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'thumbnails');

DROP POLICY IF EXISTS "Public can update thumbnails" ON storage.objects;
CREATE POLICY "Public can update thumbnails" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'thumbnails');

-- =========================================================
-- 3. Create the `site_settings` table for Curator QR and dynamic site configuration
-- =========================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
CREATE POLICY "Public can read site settings" 
ON public.site_settings FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Anyone with app can update site settings" ON public.site_settings;
CREATE POLICY "Anyone with app can update site settings" 
ON public.site_settings FOR ALL 
USING (true)
WITH CHECK (true);

-- =========================================================
-- 4. Create the `station_submissions` table for visitor suggestions
-- =========================================================
CREATE TABLE IF NOT EXISTS public.station_submissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.station_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert station submissions" ON public.station_submissions;
CREATE POLICY "Public can insert station submissions" 
ON public.station_submissions FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view and manage station submissions" ON public.station_submissions;
CREATE POLICY "Admins can view and manage station submissions" 
ON public.station_submissions FOR ALL 
USING (true)
WITH CHECK (true);

-- =========================================================
-- 5. Create the `station_reactions` table for visitor station reactions
-- =========================================================
CREATE TABLE IF NOT EXISTS public.station_reactions (
    station_id TEXT PRIMARY KEY,
    count INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.station_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read station reactions" ON public.station_reactions;
CREATE POLICY "Public can read station reactions" 
ON public.station_reactions FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Public can insert or update station reactions" ON public.station_reactions;
CREATE POLICY "Public can insert or update station reactions" 
ON public.station_reactions FOR ALL 
USING (true)
WITH CHECK (true);

-- Atomic reaction increment helper function
CREATE OR REPLACE FUNCTION increment_reaction(target_station_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    INSERT INTO public.station_reactions (station_id, count, updated_at)
    VALUES (target_station_id, 1, timezone('utc'::text, now()))
    ON CONFLICT (station_id)
    DO UPDATE SET count = station_reactions.count + 1, updated_at = timezone('utc'::text, now())
    RETURNING count INTO new_count;
    RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================
-- 6. Create the `email_subscribers` table for newsletter digest
-- =========================================================
CREATE TABLE IF NOT EXISTS public.email_subscribers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can subscribe email" ON public.email_subscribers;
CREATE POLICY "Public can subscribe email" 
ON public.email_subscribers FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view and manage subscribers" ON public.email_subscribers;
CREATE POLICY "Admins can view and manage subscribers" 
ON public.email_subscribers FOR ALL 
USING (true)
WITH CHECK (true);

-- =========================================================
-- 7. Create the `user_signins` table for unique registered listener count
-- =========================================================
CREATE TABLE IF NOT EXISTS public.user_signins (
    user_id TEXT PRIMARY KEY,
    first_signed_in_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_signed_in_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_signins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated and anon upsert user_signins" ON public.user_signins;
CREATE POLICY "Allow authenticated and anon upsert user_signins"
ON public.user_signins FOR ALL
USING (true)
WITH CHECK (true);

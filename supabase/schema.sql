-- =========================================================
-- Max Playlist / PlayIt — Database & Storage Setup
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

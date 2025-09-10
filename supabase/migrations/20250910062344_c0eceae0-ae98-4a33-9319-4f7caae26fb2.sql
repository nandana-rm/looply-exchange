-- Add missing columns to listings table for complete item data
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS condition text,
ADD COLUMN IF NOT EXISTS mode text DEFAULT 'gift',
ADD COLUMN IF NOT EXISTS price decimal(10,2),
ADD COLUMN IF NOT EXISTS desired_tags text[],
ADD COLUMN IF NOT EXISTS desired_text text;

-- Update listings table to include view count for tracking
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;
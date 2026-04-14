-- =============================================
-- Supabase Migration: Watchlist App
-- Run this SQL in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query)
-- =============================================

-- Table for storing user library items (movie/TV status + favorites)
CREATE TABLE IF NOT EXISTS user_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  status TEXT CHECK (status IN ('watched', 'watching', 'to-watch') OR status IS NULL),
  is_favorite BOOLEAN DEFAULT FALSE,
  item_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id, media_type)
);

-- Create index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_status ON user_library(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_library_media ON user_library(user_id, media_type);

-- Enable Row Level Security
ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;

-- RLS Policies: each user can only access their own data
CREATE POLICY "Users can view own library"
  ON user_library FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own library"
  ON user_library FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own library"
  ON user_library FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own library"
  ON user_library FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_library_updated_at
  BEFORE UPDATE ON user_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

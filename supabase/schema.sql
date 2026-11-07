-- ==============================================================================
-- ClipPilot - Supabase PostgreSQL Database Schema
-- Complete relational schema with Row-Level Security (RLS) policies
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES / USERS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  handle TEXT NOT NULL,
  avatar_url TEXT,
  default_tags TEXT[] DEFAULT ARRAY['shorts', 'reels', 'creator'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SOCIAL ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'instagram', 'tiktok')),
  platform_name TEXT NOT NULL,
  handle TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  is_connected BOOLEAN DEFAULT true,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[] DEFAULT ARRAY[]::TEXT[],
  followers_count INTEGER DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, handle)
);

-- 3. VIDEOS TABLE (Master original video assets)
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  thumbnail_url TEXT NOT NULL,
  storage_path TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 30,
  file_size_mb NUMERIC(6, 2) NOT NULL DEFAULT 10.0,
  aspect_ratio TEXT NOT NULL DEFAULT '9:16' CHECK (aspect_ratio IN ('9:16', '16:9', '1:1')),
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('draft', 'ready', 'scheduled', 'published', 'failed')),
  scheduled_for TIMESTAMPTZ,
  platform_captions JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. VIDEO PLATFORM POSTS TABLE (Per-platform publication records)
CREATE TABLE IF NOT EXISTS public.video_platform_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.social_accounts(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'instagram', 'tiktok')),
  external_post_id TEXT,
  external_url TEXT,
  caption TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'published', 'failed')),
  error_message TEXT,
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  comments BIGINT DEFAULT 0,
  shares BIGINT DEFAULT 0,
  engagement_rate NUMERIC(5, 2) DEFAULT 0.00,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DAILY VIDEO ANALYTICS TABLE (Time-series per video & platform)
CREATE TABLE IF NOT EXISTS public.daily_video_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.video_platform_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recorded_date DATE NOT NULL,
  views_delta BIGINT DEFAULT 0,
  likes_delta BIGINT DEFAULT 0,
  comments_delta BIGINT DEFAULT 0,
  shares_delta BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, recorded_date)
);

-- 6. DAILY ACCOUNT ANALYTICS TABLE (Daily follower & total views snapshots)
CREATE TABLE IF NOT EXISTS public.daily_account_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES public.social_accounts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recorded_date DATE NOT NULL,
  followers_count INTEGER NOT NULL DEFAULT 0,
  net_new_followers INTEGER NOT NULL DEFAULT 0,
  total_views BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, recorded_date)
);

-- 7. CONTENT IDEAS TABLE (Calendar & pipeline ideation cards)
CREATE TABLE IF NOT EXISTS public.content_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  target_platforms TEXT[] DEFAULT ARRAY['youtube', 'tiktok']::TEXT[],
  stage TEXT NOT NULL DEFAULT 'idea' CHECK (stage IN ('idea', 'scripting', 'editing', 'ready', 'published')),
  target_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SCHEDULED POSTS QUEUE TABLE (Dispatch workers queue)
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_platforms TEXT[] NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- Strict isolation ensuring users only access their own content
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_platform_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_video_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_account_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view and edit own profile" 
  ON public.profiles FOR ALL 
  USING (auth.uid() = id);

-- Social Accounts Policies
CREATE POLICY "Users can manage own connected accounts" 
  ON public.social_accounts FOR ALL 
  USING (auth.uid() = user_id);

-- Videos Policies
CREATE POLICY "Users can manage own video assets" 
  ON public.videos FOR ALL 
  USING (auth.uid() = user_id);

-- Video Platform Posts Policies
CREATE POLICY "Users can manage own platform posts" 
  ON public.video_platform_posts FOR ALL 
  USING (auth.uid() = user_id);

-- Daily Analytics Policies
CREATE POLICY "Users can view own video analytics" 
  ON public.daily_video_analytics FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own account analytics" 
  ON public.daily_account_analytics FOR ALL 
  USING (auth.uid() = user_id);

-- Content Ideas Policies
CREATE POLICY "Users can manage own content ideas" 
  ON public.content_ideas FOR ALL 
  USING (auth.uid() = user_id);

-- Scheduled Posts Policies
CREATE POLICY "Users can manage own scheduled posts" 
  ON public.scheduled_posts FOR ALL 
  USING (auth.uid() = user_id);

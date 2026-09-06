-- ==============================================================================
-- NŪR SOCIAL — DATABASE INITIALIZATION MIGRATION (PHASE 1)
-- ==============================================================================
-- Description: Production-ready PostgreSQL schema with RLS, triggers, indexes,
-- and Supabase Storage bucket configuration for Nūr Social.
-- ==============================================================================

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create PROFILES table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'editor', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create BRAND_SETTINGS table
CREATE TABLE IF NOT EXISTS public.brand_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL DEFAULT 'Nūr Social',
    brand_description TEXT DEFAULT '',
    website TEXT DEFAULT '',
    contact_email TEXT DEFAULT '',
    contact_phone TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create CONTENT_PREFERENCES table
CREATE TABLE IF NOT EXISTS public.content_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    default_language TEXT NOT NULL DEFAULT 'English',
    default_timezone TEXT NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Create MEDIA table
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    width INTEGER,
    height INTEGER,
    duration NUMERIC,
    status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('uploaded', 'processing', 'ready', 'failed', 'deleted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Create POSTS table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    media_id UUID REFERENCES public.media(id) ON DELETE SET NULL,
    title TEXT,
    topic TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'ready', 'published', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Add Indexes for Query Optimization
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_media_user_id ON public.media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_status ON public.media(status);
CREATE INDEX IF NOT EXISTS idx_media_file_type ON public.media(file_type);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_media_id ON public.posts(media_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);

-- 8. Auto-update timestamp triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_brand_settings_updated_at BEFORE UPDATE ON public.brand_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_content_preferences_updated_at BEFORE UPDATE ON public.content_preferences FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON public.media FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 9. Automatic Profile & Settings creation on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert profile
    INSERT INTO public.profiles (id, user_id, full_name, email, role)
    VALUES (
        NEW.id,
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        'admin'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Insert default brand settings
    INSERT INTO public.brand_settings (user_id, brand_name, brand_description, website)
    VALUES (
        NEW.id,
        'Nūr Social',
        'AI-Powered Islamic Social Media Management',
        ''
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- Insert default content preferences
    INSERT INTO public.content_preferences (user_id, default_language, default_timezone)
    VALUES (
        NEW.id,
        'English',
        'UTC'
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Brand Settings Policies
CREATE POLICY "Users can view own brand settings"
    ON public.brand_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own brand settings"
    ON public.brand_settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brand settings"
    ON public.brand_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Content Preferences Policies
CREATE POLICY "Users can view own content preferences"
    ON public.content_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own content preferences"
    ON public.content_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content preferences"
    ON public.content_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Media Policies
CREATE POLICY "Users can view own media"
    ON public.media FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own media"
    ON public.media FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own media"
    ON public.media FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own media"
    ON public.media FOR DELETE
    USING (auth.uid() = user_id);

-- Posts Policies
CREATE POLICY "Users can view own posts"
    ON public.posts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts"
    ON public.posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
    ON public.posts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
    ON public.posts FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 11. SUPABASE STORAGE SETUP (Media Bucket)
-- ==============================================================================

-- Create the 'media' storage bucket if it does not exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for the 'media' bucket
-- Note: Files are stored at path: {user_id}/{filename}

CREATE POLICY "Authenticated users can upload media to own folder"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'media' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can view their own media in storage or public bucket"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'media' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update their own media in storage"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'media' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete their own media in storage"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'media' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

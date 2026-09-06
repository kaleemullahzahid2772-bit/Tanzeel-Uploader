-- ==============================================================================
-- NŪR SOCIAL — PHASE 2: AI CONTENT BRAIN MIGRATION
-- ==============================================================================
-- Description: Creates ai_generations and platform_content tables with
-- indexes, triggers, and Row Level Security (RLS) policies.
-- ==============================================================================

-- 1. Create AI_GENERATIONS table
CREATE TABLE IF NOT EXISTS public.ai_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    model TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
    prompt TEXT NOT NULL,
    source_content JSONB NOT NULL DEFAULT '{}'::jsonb,
    generated_content JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create PLATFORM_CONTENT table
CREATE TABLE IF NOT EXISTS public.platform_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'whatsapp')),
    title TEXT,
    hook TEXT,
    caption TEXT,
    description TEXT,
    hashtags JSONB NOT NULL DEFAULT '[]'::jsonb,
    keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    cta TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'needs_review')),
    version INTEGER NOT NULL DEFAULT 1,
    quality_score INTEGER NOT NULL DEFAULT 100,
    quality_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Add Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_ai_generations_post_id ON public.ai_generations(post_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON public.ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_content_post_id ON public.platform_content(post_id);
CREATE INDEX IF NOT EXISTS idx_platform_content_user_id ON public.platform_content(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_content_platform ON public.platform_content(platform);

-- 4. Auto-update updated_at triggers
CREATE TRIGGER update_ai_generations_updated_at BEFORE UPDATE ON public.ai_generations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_platform_content_updated_at BEFORE UPDATE ON public.platform_content FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_content ENABLE ROW LEVEL SECURITY;

-- ai_generations policies
CREATE POLICY "Users can view own ai_generations"
    ON public.ai_generations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai_generations"
    ON public.ai_generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai_generations"
    ON public.ai_generations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai_generations"
    ON public.ai_generations FOR DELETE
    USING (auth.uid() = user_id);

-- platform_content policies
CREATE POLICY "Users can view own platform_content"
    ON public.platform_content FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own platform_content"
    ON public.platform_content FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own platform_content"
    ON public.platform_content FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own platform_content"
    ON public.platform_content FOR DELETE
    USING (auth.uid() = user_id);

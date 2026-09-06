-- ==============================================================================
-- NŪR SOCIAL — PHASE 6: SMART SCHEDULING & CONTENT CALENDAR MIGRATION
-- ==============================================================================
-- Description: Creates scheduled_posts and in_app_notifications tables with
-- atomic locking fields, timezone tracking, content snapshots, indexes, and RLS.
-- ==============================================================================

-- 1. Create SCHEDULED_POSTS table
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
    social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE SET NULL,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'whatsapp')),
    account_name TEXT NOT NULL,
    content_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    media_id UUID REFERENCES public.media(id) ON DELETE SET NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    status TEXT NOT NULL DEFAULT 'scheduled' 
        CHECK (status IN ('scheduled', 'processing', 'published', 'failed', 'cancelled', 'paused', 'needs_reconnect')),
    publishing_job_id UUID REFERENCES public.publishing_jobs(id) ON DELETE SET NULL,
    locked_at TIMESTAMPTZ,
    locked_by TEXT,
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,
    error_message TEXT,
    published_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create IN_APP_NOTIFICATIONS table
CREATE TABLE IF NOT EXISTS public.in_app_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('success', 'error', 'warning', 'info')),
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Add Indexes for Query Optimization, Worker Polling, and Calendar Views
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON public.scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_due_status ON public.scheduled_posts(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_calendar ON public.scheduled_posts(user_id, scheduled_for, status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_platform ON public.scheduled_posts(platform);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_social_account ON public.scheduled_posts(social_account_id);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user ON public.in_app_notifications(user_id, is_read, created_at DESC);

-- 4. Auto-update updated_at trigger on scheduled_posts
CREATE TRIGGER update_scheduled_posts_updated_at 
    BEFORE UPDATE ON public.scheduled_posts 
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;

-- scheduled_posts RLS
CREATE POLICY "Users can view own scheduled_posts"
    ON public.scheduled_posts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled_posts"
    ON public.scheduled_posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled_posts"
    ON public.scheduled_posts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled_posts"
    ON public.scheduled_posts FOR DELETE
    USING (auth.uid() = user_id);

-- in_app_notifications RLS
CREATE POLICY "Users can view own in_app_notifications"
    ON public.in_app_notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own in_app_notifications"
    ON public.in_app_notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own in_app_notifications"
    ON public.in_app_notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own in_app_notifications"
    ON public.in_app_notifications FOR DELETE
    USING (auth.uid() = user_id);

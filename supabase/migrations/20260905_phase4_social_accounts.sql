-- ==============================================================================
-- NŪR SOCIAL — PHASE 4: SOCIAL MEDIA ACCOUNTS & SECURE OAUTH SYSTEM MIGRATION
-- ==============================================================================
-- Description: Creates social_accounts and oauth_states tables with military-grade
-- token encryption fields, indexes, triggers, and Row Level Security (RLS).
-- ==============================================================================

-- 1. Create SOCIAL_ACCOUNTS table
CREATE TABLE IF NOT EXISTS public.social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'whatsapp')),
    account_id TEXT NOT NULL,
    account_name TEXT NOT NULL,
    username TEXT,
    profile_image_url TEXT,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'connected' 
        CHECK (status IN ('connected', 'expiring_soon', 'expired', 'revoked', 'error', 'disconnected')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    connected_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_platform_account UNIQUE (user_id, platform, account_id)
);

-- 2. Create OAUTH_STATES table for CSRF & PKCE protection
CREATE TABLE IF NOT EXISTS public.oauth_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'whatsapp')),
    state_token TEXT NOT NULL UNIQUE,
    code_verifier TEXT,
    redirect_uri TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Add Indexes for Query Optimization
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON public.social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON public.social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_status ON public.social_accounts(status);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_platform ON public.social_accounts(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_oauth_states_state_token ON public.oauth_states(state_token);
CREATE INDEX IF NOT EXISTS idx_oauth_states_user_id ON public.oauth_states(user_id);

-- 4. Auto-update updated_at trigger on social_accounts
CREATE TRIGGER update_social_accounts_updated_at 
    BEFORE UPDATE ON public.social_accounts 
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- social_accounts RLS policies
CREATE POLICY "Users can view own social_accounts"
    ON public.social_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social_accounts"
    ON public.social_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social_accounts"
    ON public.social_accounts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social_accounts"
    ON public.social_accounts FOR DELETE
    USING (auth.uid() = user_id);

-- oauth_states RLS policies
CREATE POLICY "Users can view own oauth_states"
    ON public.oauth_states FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own oauth_states"
    ON public.oauth_states FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own oauth_states"
    ON public.oauth_states FOR DELETE
    USING (auth.uid() = user_id);

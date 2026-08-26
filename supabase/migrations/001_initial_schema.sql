-- ====================================================================
-- KNOWSIGHTS TOPIC MIXER - INITIAL SCHEMA
-- Migration: 001_initial_schema.sql
-- ====================================================================

-- 1. Helper Function for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION public.knowsights_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Content Angles Library
CREATE TABLE IF NOT EXISTS public.knowsights_content_angles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Subjects Table
CREATE TABLE IF NOT EXISTS public.knowsights_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    sort_order INTEGER DEFAULT 0,
    weight NUMERIC NOT NULL DEFAULT 1.0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_knowsights_subjects_updated_at
BEFORE UPDATE ON public.knowsights_subjects
FOR EACH ROW
EXECUTE FUNCTION public.knowsights_set_updated_at();

-- 4. Topics Table
CREATE TABLE IF NOT EXISTS public.knowsights_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.knowsights_subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_knowsights_topics_subject_name UNIQUE (subject_id, name)
);

CREATE TRIGGER trg_knowsights_topics_updated_at
BEFORE UPDATE ON public.knowsights_topics
FOR EACH ROW
EXECUTE FUNCTION public.knowsights_set_updated_at();

-- 5. Subtopics Table (Master Taxonomy Candidates)
CREATE TABLE IF NOT EXISTS public.knowsights_subtopics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_sr BIGINT,
    topic_id UUID NOT NULL REFERENCES public.knowsights_topics(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    normalized_text TEXT GENERATED ALWAYS AS (lower(trim(regexp_replace(text, '\s+', ' ', 'g')))) STORED,
    used BOOLEAN NOT NULL DEFAULT false,
    used_at TIMESTAMPTZ,
    last_shown_at TIMESTAMPTZ,
    times_shown INTEGER NOT NULL DEFAULT 0,
    video_url TEXT,
    notes TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_knowsights_subtopics_topic_text UNIQUE (topic_id, normalized_text)
);

CREATE TRIGGER trg_knowsights_subtopics_updated_at
BEFORE UPDATE ON public.knowsights_subtopics
FOR EACH ROW
EXECUTE FUNCTION public.knowsights_set_updated_at();

-- 6. Daily Batches Table
CREATE TABLE IF NOT EXISTS public.knowsights_daily_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_date DATE NOT NULL,
    selection_mode TEXT NOT NULL,
    requested_size INTEGER NOT NULL DEFAULT 12,
    subject_filter JSONB,
    settings_snapshot JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Daily Batch Items Table
CREATE TABLE IF NOT EXISTS public.knowsights_daily_batch_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.knowsights_daily_batches(id) ON DELETE CASCADE,
    subtopic_id UUID NOT NULL REFERENCES public.knowsights_subtopics(id) ON DELETE CASCADE,
    angle_id UUID REFERENCES public.knowsights_content_angles(id) ON DELETE SET NULL,
    position INTEGER NOT NULL,
    selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'shown', -- 'shown', 'replaced', 'used'
    previous_times_shown INTEGER DEFAULT 0,
    previous_last_shown_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_knowsights_batch_subtopic UNIQUE (batch_id, subtopic_id)
);

-- 8. Subtopic Audit History Events Table
CREATE TABLE IF NOT EXISTS public.knowsights_subtopic_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subtopic_id UUID NOT NULL REFERENCES public.knowsights_subtopics(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.knowsights_daily_batches(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'shown', 'replaced', 'marked_used', 'undo_used', 'video_url_added', 'video_url_removed', 'note_updated'
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Application Settings Table
CREATE TABLE IF NOT EXISTS public.knowsights_app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_knowsights_app_settings_updated_at
BEFORE UPDATE ON public.knowsights_app_settings
FOR EACH ROW
EXECUTE FUNCTION public.knowsights_set_updated_at();

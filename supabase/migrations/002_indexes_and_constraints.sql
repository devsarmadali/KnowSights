-- ====================================================================
-- KNOWSIGHTS TOPIC MIXER - INDEXES & CONSTRAINTS
-- Migration: 002_indexes_and_constraints.sql
-- ====================================================================

-- 1. Partial Index for High-Speed Candidate Selection Pool
-- Only indexes eligible records: active = true AND used = false
CREATE INDEX IF NOT EXISTS idx_knowsights_subtopics_candidate_pool 
ON public.knowsights_subtopics (topic_id, last_shown_at, times_shown) 
WHERE used = false AND active = true;

-- 2. General Query Indexes on subtopics
CREATE INDEX IF NOT EXISTS idx_knowsights_subtopics_used_active 
ON public.knowsights_subtopics (used, active);

CREATE INDEX IF NOT EXISTS idx_knowsights_subtopics_topic_id 
ON public.knowsights_subtopics (topic_id);

CREATE INDEX IF NOT EXISTS idx_knowsights_subtopics_last_shown_at 
ON public.knowsights_subtopics (last_shown_at);

CREATE INDEX IF NOT EXISTS idx_knowsights_subtopics_source_sr 
ON public.knowsights_subtopics (source_sr);

-- 3. Topics Indexes
CREATE INDEX IF NOT EXISTS idx_knowsights_topics_subject_id 
ON public.knowsights_topics (subject_id);

-- 4. Daily Batches and Items Indexes
CREATE INDEX IF NOT EXISTS idx_knowsights_daily_batches_date 
ON public.knowsights_daily_batches (batch_date);

CREATE INDEX IF NOT EXISTS idx_knowsights_batch_items_batch_id 
ON public.knowsights_daily_batch_items (batch_id);

CREATE INDEX IF NOT EXISTS idx_knowsights_batch_items_subtopic_id 
ON public.knowsights_daily_batch_items (subtopic_id);

CREATE INDEX IF NOT EXISTS idx_knowsights_batch_items_status 
ON public.knowsights_daily_batch_items (status);

-- 5. Subtopic Audit Events Indexes
CREATE INDEX IF NOT EXISTS idx_knowsights_events_subtopic_id 
ON public.knowsights_subtopic_events (subtopic_id);

CREATE INDEX IF NOT EXISTS idx_knowsights_events_batch_id 
ON public.knowsights_subtopic_events (batch_id);

CREATE INDEX IF NOT EXISTS idx_knowsights_events_type_date 
ON public.knowsights_subtopic_events (event_type, created_at);

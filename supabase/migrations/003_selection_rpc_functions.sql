-- ====================================================================
-- KNOWSIGHTS TOPIC MIXER - SELECTION ENGINE (POSTGRES RPC)
-- Migration: 003_selection_rpc_functions.sql
-- ====================================================================

-- 1. Core RPC: Generate Daily Mix
CREATE OR REPLACE FUNCTION public.knowsights_generate_daily_mix(
    p_size INTEGER DEFAULT 12,
    p_mode TEXT DEFAULT 'BALANCED',
    p_subject_ids UUID[] DEFAULT NULL,
    p_batch_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_batch_id UUID;
    v_cooldown_days INTEGER := 7;
    v_max_same_subject INTEGER := 2;
    v_max_same_topic INTEGER := 1;
    v_settings JSONB;
    v_selected_count INTEGER := 0;
    v_rec RECORD;
    v_candidate RECORD;
    v_angle_id UUID;
    v_subject_counts JSONB := '{}'::JSONB;
    v_topic_counts JSONB := '{}'::JSONB;
    v_subj_cnt INTEGER;
    v_top_cnt INTEGER;
    v_selected_ids UUID[] := ARRAY[]::UUID[];
    v_result JSONB;
BEGIN
    -- Read settings snapshot if available
    SELECT value INTO v_settings FROM public.knowsights_app_settings WHERE key = 'general';
    IF v_settings IS NOT NULL THEN
        v_cooldown_days := COALESCE((v_settings->>'recent_repeat_cooldown_days')::INTEGER, 7);
        v_max_same_subject := COALESCE((v_settings->>'max_same_subject')::INTEGER, 2);
        v_max_same_topic := COALESCE((v_settings->>'max_same_topic')::INTEGER, 1);
    END IF;

    -- Adjust limits for DEEP_DIVE mode where all items come from 1 subject
    IF UPPER(p_mode) = 'DEEP_DIVE' THEN
        v_max_same_subject := p_size;
        v_max_same_topic := GREATEST(1, CEIL(p_size::FLOAT / 4.0)::INTEGER);
    END IF;

    -- Create Daily Batch Record
    INSERT INTO public.knowsights_daily_batches (
        batch_date,
        selection_mode,
        requested_size,
        subject_filter,
        settings_snapshot
    ) VALUES (
        p_batch_date,
        UPPER(p_mode),
        p_size,
        CASE WHEN p_subject_ids IS NOT NULL THEN to_jsonb(p_subject_ids) ELSE NULL END,
        v_settings
    ) RETURNING id INTO v_batch_id;

    -- Create temporary table with scored candidate pool
    CREATE TEMPORARY TABLE temp_scored_candidates ON COMMIT DROP AS
    SELECT 
        st.id AS subtopic_id,
        st.topic_id,
        t.subject_id,
        st.text AS subtopic_text,
        st.times_shown,
        st.last_shown_at,
        s.weight AS subject_weight,
        -- Deterministic Scoring Logic based on mode, recency, and times_shown
        (
            CASE 
                -- DISCOVERY: Prioritize never shown
                WHEN UPPER(p_mode) = 'DISCOVERY' THEN
                    (CASE WHEN st.times_shown = 0 THEN 1000.0 ELSE 1.0 END) +
                    (random() * 50.0) +
                    (1.0 / (1.0 + st.times_shown)) * 10.0

                -- REVISIT_UNUSED: Prioritize shown > 0 but used = false
                WHEN UPPER(p_mode) = 'REVISIT_UNUSED' THEN
                    (CASE WHEN st.times_shown > 0 THEN 500.0 + (st.times_shown * 10.0) ELSE 1.0 END) +
                    (random() * 50.0)

                -- RANDOM_EXPLORATION: High entropy
                WHEN UPPER(p_mode) = 'RANDOM_EXPLORATION' THEN
                    (random() * 100.0) +
                    (CASE WHEN st.last_shown_at IS NULL OR st.last_shown_at < NOW() - (v_cooldown_days || ' days')::INTERVAL THEN 20.0 ELSE 0.0 END)

                -- CURRENT_AFFAIRS: Boost contemporary subjects
                WHEN UPPER(p_mode) = 'CURRENT_AFFAIRS' THEN
                    (CASE WHEN s.name ILIKE '%Pakistan%' OR s.name ILIKE '%Current%' OR s.name ILIKE '%Technology%' OR s.name ILIKE '%AI%' OR s.name ILIKE '%Science%' OR s.name ILIKE '%International Relations%' THEN 200.0 ELSE 10.0 END) +
                    (CASE WHEN st.times_shown = 0 THEN 40.0 ELSE 0.0 END) +
                    (CASE WHEN st.last_shown_at IS NULL OR st.last_shown_at < NOW() - (v_cooldown_days || ' days')::INTERVAL THEN 30.0 ELSE 0.0 END) +
                    (random() * 20.0)

                -- BALANCED (Default): Balanced across subjects, recency cooldown, times_shown penalty
                ELSE
                    (CASE WHEN st.times_shown = 0 THEN 50.0 ELSE 0.0 END) +
                    (CASE 
                        WHEN st.last_shown_at IS NULL THEN 40.0
                        WHEN st.last_shown_at < NOW() - (v_cooldown_days || ' days')::INTERVAL THEN 30.0
                        ELSE 5.0 
                    END) +
                    (1.0 / (1.0 + st.times_shown * 0.5)) * 20.0 +
                    (s.weight * 10.0) +
                    (random() * 15.0)
            END
        ) AS score
    FROM public.knowsights_subtopics st
    JOIN public.knowsights_topics t ON st.topic_id = t.id
    JOIN public.knowsights_subjects s ON t.subject_id = s.id
    WHERE st.active = true 
      AND st.used = false -- PERMANENT ELIGIBILITY RULE
      AND (p_subject_ids IS NULL OR s.id = ANY(p_subject_ids))
    ORDER BY score DESC;

    -- PASS 1: Strict Diversity Ceilings (max_same_subject, max_same_topic)
    FOR v_candidate IN SELECT * FROM temp_scored_candidates ORDER BY score DESC LOOP
        EXIT WHEN v_selected_count >= p_size;

        v_subj_cnt := COALESCE((v_subject_counts->>v_candidate.subject_id::TEXT)::INTEGER, 0);
        v_top_cnt := COALESCE((v_topic_counts->>v_candidate.topic_id::TEXT)::INTEGER, 0);

        IF v_subj_cnt < v_max_same_subject AND v_top_cnt < v_max_same_topic THEN
            -- Pick random content angle
            SELECT id INTO v_angle_id 
            FROM public.knowsights_content_angles 
            WHERE active = true 
            ORDER BY random() 
            LIMIT 1;

            v_selected_count := v_selected_count + 1;
            v_selected_ids := array_append(v_selected_ids, v_candidate.subtopic_id);

            -- Insert batch item
            INSERT INTO public.knowsights_daily_batch_items (
                batch_id,
                subtopic_id,
                angle_id,
                position,
                status,
                previous_times_shown,
                previous_last_shown_at
            ) VALUES (
                v_batch_id,
                v_candidate.subtopic_id,
                v_angle_id,
                v_selected_count,
                'shown',
                v_candidate.times_shown,
                v_candidate.last_shown_at
            );

            -- Update subtopic counters (DOES NOT SET used = true)
            UPDATE public.knowsights_subtopics
            SET times_shown = times_shown + 1,
                last_shown_at = NOW()
            WHERE id = v_candidate.subtopic_id;

            -- Log event
            INSERT INTO public.knowsights_subtopic_events (
                subtopic_id,
                batch_id,
                event_type,
                metadata
            ) VALUES (
                v_candidate.subtopic_id,
                v_batch_id,
                'shown',
                jsonb_build_object('position', v_selected_count, 'mode', p_mode)
            );

            -- Update diversity trackers
            v_subject_counts := jsonb_set(v_subject_counts, ARRAY[v_candidate.subject_id::TEXT], to_jsonb(v_subj_cnt + 1));
            v_topic_counts := jsonb_set(v_topic_counts, ARRAY[v_candidate.topic_id::TEXT], to_jsonb(v_top_cnt + 1));
        END IF;
    END LOOP;

    -- PASS 2: Graceful Relaxation if pool could not fill requested size
    IF v_selected_count < p_size THEN
        FOR v_candidate IN 
            SELECT * FROM temp_scored_candidates 
            WHERE subtopic_id != ALL(v_selected_ids) 
            ORDER BY score DESC 
        LOOP
            EXIT WHEN v_selected_count >= p_size;

            SELECT id INTO v_angle_id 
            FROM public.knowsights_content_angles 
            WHERE active = true 
            ORDER BY random() 
            LIMIT 1;

            v_selected_count := v_selected_count + 1;
            v_selected_ids := array_append(v_selected_ids, v_candidate.subtopic_id);

            INSERT INTO public.knowsights_daily_batch_items (
                batch_id,
                subtopic_id,
                angle_id,
                position,
                status,
                previous_times_shown,
                previous_last_shown_at
            ) VALUES (
                v_batch_id,
                v_candidate.subtopic_id,
                v_angle_id,
                v_selected_count,
                'shown',
                v_candidate.times_shown,
                v_candidate.last_shown_at
            );

            UPDATE public.knowsights_subtopics
            SET times_shown = times_shown + 1,
                last_shown_at = NOW()
            WHERE id = v_candidate.subtopic_id;

            INSERT INTO public.knowsights_subtopic_events (
                subtopic_id,
                batch_id,
                event_type,
                metadata
            ) VALUES (
                v_candidate.subtopic_id,
                v_batch_id,
                'shown',
                jsonb_build_object('position', v_selected_count, 'mode', p_mode, 'relaxed', true)
            );
        END LOOP;
    END IF;

    -- Fetch and return full batch structure
    SELECT jsonb_build_object(
        'batch_id', b.id,
        'batch_date', b.batch_date,
        'selection_mode', b.selection_mode,
        'requested_size', b.requested_size,
        'created_at', b.created_at,
        'items', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'batch_item_id', bi.id,
                    'position', bi.position,
                    'status', bi.status,
                    'selected_at', bi.selected_at,
                    'angle', (CASE WHEN a.id IS NOT NULL THEN jsonb_build_object('id', a.id, 'name', a.name, 'description', a.description) ELSE NULL END),
                    'subtopic', jsonb_build_object(
                        'id', st.id,
                        'source_sr', st.source_sr,
                        'text', st.text,
                        'used', st.used,
                        'used_at', st.used_at,
                        'times_shown', st.times_shown,
                        'last_shown_at', st.last_shown_at,
                        'video_url', st.video_url,
                        'notes', st.notes,
                        'topic', jsonb_build_object(
                            'id', t.id,
                            'name', t.name,
                            'slug', t.slug,
                            'subject', jsonb_build_object(
                                'id', s.id,
                                'name', s.name,
                                'slug', s.slug
                            )
                        )
                    )
                ) ORDER BY bi.position ASC
            ), '[]'::JSONB)
            FROM public.knowsights_daily_batch_items bi
            JOIN public.knowsights_subtopics st ON bi.subtopic_id = st.id
            JOIN public.knowsights_topics t ON st.topic_id = t.id
            JOIN public.knowsights_subjects s ON t.subject_id = s.id
            LEFT JOIN public.knowsights_content_angles a ON bi.angle_id = a.id
            WHERE bi.batch_id = b.id AND bi.status != 'replaced'
        )
    ) INTO v_result
    FROM public.knowsights_daily_batches b
    WHERE b.id = v_batch_id;

    RETURN v_result;
END;
$$;

-- 2. RPC: Replace Single Batch Item
CREATE OR REPLACE FUNCTION public.knowsights_replace_batch_item(
    p_batch_item_id UUID,
    p_mode TEXT DEFAULT 'BALANCED'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_item RECORD;
    v_batch RECORD;
    v_new_candidate RECORD;
    v_new_angle_id UUID;
    v_new_item_id UUID;
    v_existing_subtopic_ids UUID[];
    v_result JSONB;
BEGIN
    -- Fetch old batch item
    SELECT * INTO v_old_item 
    FROM public.knowsights_daily_batch_items 
    WHERE id = p_batch_item_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Batch item not found: %', p_batch_item_id;
    END IF;

    -- Fetch batch
    SELECT * INTO v_batch 
    FROM public.knowsights_daily_batches 
    WHERE id = v_old_item.batch_id;

    -- Mark old item as replaced (DOES NOT set subtopic.used = true)
    UPDATE public.knowsights_daily_batch_items
    SET status = 'replaced'
    WHERE id = p_batch_item_id;

    -- Log replacement event on old subtopic
    INSERT INTO public.knowsights_subtopic_events (
        subtopic_id,
        batch_id,
        event_type,
        metadata
    ) VALUES (
        v_old_item.subtopic_id,
        v_old_item.batch_id,
        'replaced',
        jsonb_build_object('batch_item_id', p_batch_item_id)
    );

    -- Get all subtopic IDs currently in this batch
    SELECT array_agg(subtopic_id) INTO v_existing_subtopic_ids
    FROM public.knowsights_daily_batch_items
    WHERE batch_id = v_old_item.batch_id;

    -- Pick a fresh candidate (active = true, used = false, not already in batch)
    SELECT 
        st.id AS subtopic_id,
        st.times_shown,
        st.last_shown_at
    INTO v_new_candidate
    FROM public.knowsights_subtopics st
    JOIN public.knowsights_topics t ON st.topic_id = t.id
    JOIN public.knowsights_subjects s ON t.subject_id = s.id
    WHERE st.active = true 
      AND st.used = false 
      AND st.id != ALL(v_existing_subtopic_ids)
    ORDER BY 
        (CASE WHEN st.times_shown = 0 THEN 50.0 ELSE 0.0 END) +
        (1.0 / (1.0 + st.times_shown * 0.5)) * 20.0 +
        (random() * 30.0) DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No available unused candidates found to replace item';
    END IF;

    -- Pick random content angle
    SELECT id INTO v_new_angle_id 
    FROM public.knowsights_content_angles 
    WHERE active = true 
    ORDER BY random() 
    LIMIT 1;

    -- Insert replacement item with original position
    INSERT INTO public.knowsights_daily_batch_items (
        batch_id,
        subtopic_id,
        angle_id,
        position,
        status,
        previous_times_shown,
        previous_last_shown_at
    ) VALUES (
        v_old_item.batch_id,
        v_new_candidate.subtopic_id,
        v_new_angle_id,
        v_old_item.position,
        'shown',
        v_new_candidate.times_shown,
        v_new_candidate.last_shown_at
    ) RETURNING id INTO v_new_item_id;

    -- Update newly chosen subtopic counters
    UPDATE public.knowsights_subtopics
    SET times_shown = times_shown + 1,
        last_shown_at = NOW()
    WHERE id = v_new_candidate.subtopic_id;

    -- Log shown event on new subtopic
    INSERT INTO public.knowsights_subtopic_events (
        subtopic_id,
        batch_id,
        event_type,
        metadata
    ) VALUES (
        v_new_candidate.subtopic_id,
        v_old_item.batch_id,
        'shown',
        jsonb_build_object('replaced_item_id', p_batch_item_id, 'position', v_old_item.position)
    );

    -- Return formatted new item
    SELECT jsonb_build_object(
        'batch_item_id', bi.id,
        'position', bi.position,
        'status', bi.status,
        'selected_at', bi.selected_at,
        'angle', (CASE WHEN a.id IS NOT NULL THEN jsonb_build_object('id', a.id, 'name', a.name, 'description', a.description) ELSE NULL END),
        'subtopic', jsonb_build_object(
            'id', st.id,
            'source_sr', st.source_sr,
            'text', st.text,
            'used', st.used,
            'used_at', st.used_at,
            'times_shown', st.times_shown,
            'last_shown_at', st.last_shown_at,
            'video_url', st.video_url,
            'notes', st.notes,
            'topic', jsonb_build_object(
                'id', t.id,
                'name', t.name,
                'slug', t.slug,
                'subject', jsonb_build_object(
                    'id', s.id,
                    'name', s.name,
                    'slug', s.slug
                )
            )
        )
    ) INTO v_result
    FROM public.knowsights_daily_batch_items bi
    JOIN public.knowsights_subtopics st ON bi.subtopic_id = st.id
    JOIN public.knowsights_topics t ON st.topic_id = t.id
    JOIN public.knowsights_subjects s ON t.subject_id = s.id
    LEFT JOIN public.knowsights_content_angles a ON bi.angle_id = a.id
    WHERE bi.id = v_new_item_id;

    RETURN v_result;
END;
$$;

-- 3. RPC: Mark Subtopic Used
CREATE OR REPLACE FUNCTION public.knowsights_mark_used(
    p_subtopic_id UUID,
    p_batch_item_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Permanently mark subtopic used
    UPDATE public.knowsights_subtopics
    SET used = true,
        used_at = NOW()
    WHERE id = p_subtopic_id;

    -- 2. Update batch item status if provided
    IF p_batch_item_id IS NOT NULL THEN
        UPDATE public.knowsights_daily_batch_items
        SET status = 'used'
        WHERE id = p_batch_item_id;
    END IF;

    -- 3. Log event
    INSERT INTO public.knowsights_subtopic_events (
        subtopic_id,
        event_type,
        metadata
    ) VALUES (
        p_subtopic_id,
        'marked_used',
        jsonb_build_object('batch_item_id', p_batch_item_id)
    );

    RETURN jsonb_build_object(
        'success', true,
        'subtopic_id', p_subtopic_id,
        'used', true,
        'used_at', NOW()
    );
END;
$$;

-- 4. RPC: Undo Subtopic Used
CREATE OR REPLACE FUNCTION public.knowsights_undo_used(
    p_subtopic_id UUID,
    p_batch_item_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Restore subtopic eligibility
    UPDATE public.knowsights_subtopics
    SET used = false,
        used_at = NULL
    WHERE id = p_subtopic_id;

    -- 2. Restore batch item status if provided
    IF p_batch_item_id IS NOT NULL THEN
        UPDATE public.knowsights_daily_batch_items
        SET status = 'shown'
        WHERE id = p_batch_item_id;
    END IF;

    -- 3. Log event
    INSERT INTO public.knowsights_subtopic_events (
        subtopic_id,
        event_type,
        metadata
    ) VALUES (
        p_subtopic_id,
        'undo_used',
        jsonb_build_object('batch_item_id', p_batch_item_id)
    );

    RETURN jsonb_build_object(
        'success', true,
        'subtopic_id', p_subtopic_id,
        'used', false,
        'used_at', NULL
    );
END;
$$;

-- 5. RPC: Update Subtopic Video URL & Notes
CREATE OR REPLACE FUNCTION public.knowsights_update_metadata(
    p_subtopic_id UUID,
    p_video_url TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.knowsights_subtopics
    SET video_url = COALESCE(p_video_url, video_url),
        notes = COALESCE(p_notes, notes)
    WHERE id = p_subtopic_id;

    INSERT INTO public.knowsights_subtopic_events (
        subtopic_id,
        event_type,
        metadata
    ) VALUES (
        p_subtopic_id,
        'metadata_updated',
        jsonb_build_object('video_url', p_video_url, 'notes', p_notes)
    );

    RETURN jsonb_build_object(
        'success', true,
        'subtopic_id', p_subtopic_id,
        'video_url', p_video_url,
        'notes', p_notes
    );
END;
$$;

/**
 * KnowSights Cloudflare Edge Worker API
 * Direct D1 SQLite backend with sub-30ms global latency & zero AI costs
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-ID",
  "Content-Type": "application/json; charset=utf-8"
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS
  });
}

function getKarachiDateString(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
}

async function loadConfigFromDb(db) {
  const rows = await db.prepare("SELECT key, value FROM app_config").all();
  const config = {
    daily_mix_size: 12,
    cooldown_days: 7,
    max_same_subject: 2,
    max_same_topic: 1,
    max_same_signature_format: 2,
    minimum_production_score: 82,
    timezone: 'Asia/Karachi',
    default_mode: 'BALANCED',
    prefer_never_shown: true,
    allow_previously_shown: true,
    exclude_used: true,
    auto_generate_daily: true
  };
  if (rows && rows.results) {
    for (const r of rows.results) {
      if (['daily_mix_size', 'cooldown_days', 'max_same_subject', 'max_same_topic', 'max_same_signature_format', 'minimum_production_score'].includes(r.key)) {
        config[r.key] = parseInt(r.value, 10) || config[r.key];
      } else if (['prefer_never_shown', 'allow_previously_shown', 'exclude_used', 'auto_generate_daily'].includes(r.key)) {
        config[r.key] = r.value === 'true' || r.value === '1';
      } else {
        config[r.key] = r.value;
      }
    }
  }
  return config;
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    let params = {};
    for (const [k, v] of url.searchParams.entries()) {
      params[k] = v;
    }

    let body = {};
    if (request.method === "POST") {
      try {
        body = await request.json();
      } catch (e) {
        body = {};
      }
    }

    const action = body.action || params.action || url.pathname.replace(/^\/api\//, '').replace(/\//g, '_');
    const requestId = body.request_id || params.request_id || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const db = env.DB;

    try {
      switch (action) {
        case "stats":
        case "get_stats": {
          const totalRes = await db.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN used = 1 THEN 1 ELSE 0 END) as used_count FROM production_pool WHERE active = 1").first();
          const subjectsRes = await db.prepare(`
            SELECT 
              subject, 
              COUNT(*) as total, 
              SUM(CASE WHEN used = 1 THEN 1 ELSE 0 END) as used,
              SUM(CASE WHEN used = 0 THEN 1 ELSE 0 END) as available,
              ROUND(CAST(SUM(CASE WHEN used = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100, 1) as used_percentage
            FROM production_pool 
            WHERE active = 1 
            GROUP BY subject 
            ORDER BY subject ASC
          `).all();

          const total = totalRes?.total || 0;
          const used = totalRes?.used_count || 0;

          return jsonResponse({
            success: true,
            total_ideas: total,
            available_ideas: total - used,
            used_ideas: used,
            used_percentage: total > 0 ? Math.round((used / total) * 1000) / 10 : 0,
            used_today: 0,
            subjects_coverage: subjectsRes.results || []
          });
        }

        case "get_config": {
          const config = await loadConfigFromDb(db);
          return jsonResponse({ success: true, config });
        }

        case "save_config":
        case "update_config": {
          const newConfig = body.config || body;
          const statements = [];
          const now = new Date().toISOString();

          for (const [k, v] of Object.entries(newConfig)) {
            if (k === 'action' || k === 'request_id' || k === 'google_web_app_url') continue;
            statements.push(
              db.prepare("INSERT OR REPLACE INTO app_config (key, value) VALUES (?, ?)").bind(k, String(v))
            );
          }

          if (statements.length > 0) {
            statements.push(
              db.prepare("INSERT INTO app_events (event_id, event_type, request_id, payload, created_at) VALUES (?, 'save_config', ?, ?, ?)").bind(`evt_${Date.now()}`, requestId, JSON.stringify(newConfig), now)
            );
            await db.batch(statements);
          }

          const saved = await loadConfigFromDb(db);
          return jsonResponse({ success: true, config: saved });
        }

        case "get_initial_data": {
          const today = getKarachiDateString();
          const dbConfig = await loadConfigFromDb(db);
          const totalRes = await db.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN used = 1 THEN 1 ELSE 0 END) as used_count FROM production_pool WHERE active = 1").first();
          const subjectsRes = await db.prepare(`
            SELECT subject, COUNT(*) as total, SUM(CASE WHEN used = 1 THEN 1 ELSE 0 END) as used, SUM(CASE WHEN used = 0 THEN 1 ELSE 0 END) as available
            FROM production_pool WHERE active = 1 GROUP BY subject ORDER BY subject ASC
          `).all();

          // Check today's batch
          const todayBatchRow = await db.prepare("SELECT * FROM app_batches WHERE date = ? ORDER BY created_at DESC LIMIT 1").bind(today).first();
          let todayBatch = null;

          if (todayBatchRow) {
            const itemsRes = await db.prepare(`
              SELECT bi.*, p.* 
              FROM app_batch_items bi 
              JOIN production_pool p ON bi.idea_id = p.idea_id 
              WHERE bi.batch_id = ? 
              ORDER BY bi.position ASC
            `).bind(todayBatchRow.batch_id).all();

            todayBatch = {
              batch_id: todayBatchRow.batch_id,
              date: todayBatchRow.date,
              selection_mode: todayBatchRow.selection_mode,
              requested_size: todayBatchRow.requested_size,
              created_at: todayBatchRow.created_at,
              items: (itemsRes.results || []).map(r => ({
                batch_item_id: r.batch_item_id,
                batch_id: r.batch_id,
                idea_id: r.idea_id,
                position: r.position,
                status: r.status,
                selected_at: r.selected_at,
                idea: {
                  idea_id: r.idea_id,
                  parent_sr: r.parent_sr,
                  subtopic_seed: r.subtopic_seed,
                  subject: r.subject,
                  topic_family: r.topic_family,
                  signature_format: r.signature_format,
                  video_idea: r.video_idea,
                  curiosity_hook: r.curiosity_hook,
                  visualization_direction: r.visualization_direction,
                  source_family_guidance: r.source_family_guidance,
                  freshness_class: r.freshness_class,
                  research_status: r.research_status,
                  used: !!r.used,
                  used_date: r.used_date,
                  times_shown: r.times_shown,
                  last_shown: r.last_shown,
                  production_score: r.production_score,
                  priority_tier: r.priority_tier,
                  notes: r.notes,
                  active: !!r.active,
                  hold_reason: r.hold_reason,
                  brief_available: !!r.brief_available
                }
              }))
            };
          }

          const total = totalRes?.total || 0;
          const used = totalRes?.used_count || 0;

          return jsonResponse({
            success: true,
            config: dbConfig,
            stats: {
              total_ideas: total,
              available_ideas: total - used,
              used_ideas: used,
              used_percentage: total > 0 ? Math.round((used / total) * 1000) / 10 : 0,
              used_today: 0,
              subjects_coverage: subjectsRes.results || []
            },
            today_batch: todayBatch
          });
        }

        case "get_or_create_today_batch":
        case "get_today_batch": {
          const today = getKarachiDateString();
          const todayBatchRow = await db.prepare("SELECT * FROM app_batches WHERE date = ? ORDER BY created_at DESC LIMIT 1").bind(today).first();

          if (todayBatchRow) {
            const itemsRes = await db.prepare(`
              SELECT bi.*, p.* 
              FROM app_batch_items bi 
              JOIN production_pool p ON bi.idea_id = p.idea_id 
              WHERE bi.batch_id = ? 
              ORDER BY bi.position ASC
            `).bind(todayBatchRow.batch_id).all();

            return jsonResponse({
              success: true,
              is_new: false,
              batch: {
                batch_id: todayBatchRow.batch_id,
                date: todayBatchRow.date,
                selection_mode: todayBatchRow.selection_mode,
                requested_size: todayBatchRow.requested_size,
                created_at: todayBatchRow.created_at,
                items: (itemsRes.results || []).map(r => ({
                  batch_item_id: r.batch_item_id,
                  batch_id: r.batch_id,
                  idea_id: r.idea_id,
                  position: r.position,
                  status: r.status,
                  selected_at: r.selected_at,
                  idea: {
                    idea_id: r.idea_id,
                    parent_sr: r.parent_sr,
                    subtopic_seed: r.subtopic_seed,
                    subject: r.subject,
                    topic_family: r.topic_family,
                    signature_format: r.signature_format,
                    video_idea: r.video_idea,
                    curiosity_hook: r.curiosity_hook,
                    visualization_direction: r.visualization_direction,
                    source_family_guidance: r.source_family_guidance,
                    freshness_class: r.freshness_class,
                    research_status: r.research_status,
                    used: !!r.used,
                    used_date: r.used_date,
                    times_shown: r.times_shown,
                    last_shown: r.last_shown,
                    production_score: r.production_score,
                    priority_tier: r.priority_tier,
                    notes: r.notes,
                    active: !!r.active,
                    hold_reason: r.hold_reason,
                    brief_available: !!r.brief_available
                  }
                }))
              }
            });
          }

          // Generate new batch for today
          const dbConfig = await loadConfigFromDb(db);
          return await generateBatchInternal(db, dbConfig.default_mode || "BALANCED", dbConfig.daily_mix_size || 12, null, requestId, dbConfig);
        }

        case "generate_batch": {
          const dbConfig = await loadConfigFromDb(db);
          const mode = (body.mode || params.mode || dbConfig.default_mode || "BALANCED").toUpperCase();
          const size = parseInt(body.size || params.size || dbConfig.daily_mix_size || "12", 10);
          const subFilter = body.subject_filter || params.subject_filter || null;
          return await generateBatchInternal(db, mode, size, subFilter, requestId, dbConfig);
        }

        case "replace_item": {
          const batchId = body.batch_id || params.batch_id;
          const batchItemId = body.batch_item_id || params.batch_item_id;
          const mode = (body.mode || params.mode || "BALANCED").toUpperCase();

          if (!batchId || !batchItemId) {
            return jsonResponse({ success: false, error: "batch_id and batch_item_id required" }, 400);
          }

          const currentItem = await db.prepare("SELECT * FROM app_batch_items WHERE batch_item_id = ?").bind(batchItemId).first();
          if (!currentItem) {
            return jsonResponse({ success: false, error: "Batch item not found" }, 404);
          }

          // Fetch all items in current batch to avoid duplicates
          const batchItems = await db.prepare("SELECT idea_id FROM app_batch_items WHERE batch_id = ? AND status != 'replaced'").bind(batchId).all();
          const excludeIds = (batchItems.results || []).map(r => r.idea_id);

          // Find candidate
          const candidatesRes = await db.prepare(`
            SELECT * FROM production_pool 
            WHERE used = 0 AND active = 1 AND LOWER(research_status) != 'hold' 
            AND idea_id NOT IN (${excludeIds.map(() => '?').join(',')})
            ORDER BY times_shown ASC, production_score DESC, RANDOM()
            LIMIT 1
          `).bind(...excludeIds).first();

          if (!candidatesRes) {
            return jsonResponse({ success: false, error: "No eligible replacement found" }, 404);
          }

          const now = new Date().toISOString();
          const newItemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

          // Transaction / batch update
          await db.batch([
            db.prepare("UPDATE app_batch_items SET status = 'replaced' WHERE batch_item_id = ?").bind(batchItemId),
            db.prepare("INSERT INTO app_batch_items (batch_item_id, batch_id, idea_id, position, status, selected_at) VALUES (?, ?, ?, ?, 'shown', ?)").bind(newItemId, batchId, candidatesRes.idea_id, currentItem.position, now),
            db.prepare("UPDATE production_pool SET times_shown = times_shown + 1, last_shown = ? WHERE idea_id = ?").bind(now, candidatesRes.idea_id),
            db.prepare("INSERT INTO app_events (event_id, event_type, request_id, payload, created_at) VALUES (?, 'replace_item', ?, ?, ?)").bind(`evt_${Date.now()}`, requestId, JSON.stringify({ batch_id: batchId, old_item: batchItemId, new_item: newItemId, idea_id: candidatesRes.idea_id }), now)
          ]);

          return jsonResponse({
            success: true,
            new_item: {
              batch_item_id: newItemId,
              batch_id: batchId,
              idea_id: candidatesRes.idea_id,
              position: currentItem.position,
              status: "shown",
              selected_at: now,
              idea: {
                ...candidatesRes,
                used: !!candidatesRes.used,
                active: !!candidatesRes.active,
                brief_available: !!candidatesRes.brief_available
              }
            }
          });
        }

        case "mark_used": {
          const ideaId = body.idea_id || params.idea_id;
          if (!ideaId) return jsonResponse({ success: false, error: "idea_id is required" }, 400);

          const now = new Date().toISOString();
          const today = getKarachiDateString();

          await db.batch([
            db.prepare("UPDATE production_pool SET used = 1, used_date = ? WHERE idea_id = ?").bind(today, ideaId),
            db.prepare("UPDATE app_batch_items SET status = 'used' WHERE idea_id = ?").bind(ideaId),
            db.prepare("INSERT INTO app_events (event_id, event_type, request_id, payload, created_at) VALUES (?, 'mark_used', ?, ?, ?)").bind(`evt_${Date.now()}`, requestId, JSON.stringify({ idea_id: ideaId, used: true, date: today }), now)
          ]);

          return jsonResponse({ success: true, idea_id: ideaId, used: true, used_date: today });
        }

        case "undo_used": {
          const ideaId = body.idea_id || params.idea_id;
          if (!ideaId) return jsonResponse({ success: false, error: "idea_id is required" }, 400);

          const now = new Date().toISOString();

          await db.batch([
            db.prepare("UPDATE production_pool SET used = 0, used_date = NULL WHERE idea_id = ?").bind(ideaId),
            db.prepare("UPDATE app_batch_items SET status = 'shown' WHERE idea_id = ? AND status = 'used'").bind(ideaId),
            db.prepare("INSERT INTO app_events (event_id, event_type, request_id, payload, created_at) VALUES (?, 'undo_used', ?, ?, ?)").bind(`evt_${Date.now()}`, requestId, JSON.stringify({ idea_id: ideaId, used: false }), now)
          ]);

          return jsonResponse({ success: true, idea_id: ideaId, used: false, used_date: null });
        }

        case "get_production_pool":
        case "browse_production_pool":
        case "search": {
          const q = (body.query || params.query || "").trim();
          const subj = (body.subject || params.subject || "").trim();
          const fmt = (body.format || params.format || "").trim();
          const rStatus = (body.research_status || params.research_status || "").trim();
          const status = (body.status || params.status || "all").trim().toLowerCase();
          const page = parseInt(body.page || params.page || "1", 10);
          const pageSize = parseInt(body.pageSize || params.pageSize || "30", 10);
          const offset = (page - 1) * pageSize;

          let whereClauses = ["1=1"];
          let bindings = [];

          if (q) {
            whereClauses.push("(idea_id LIKE ? OR video_idea LIKE ? OR curiosity_hook LIKE ? OR topic_family LIKE ? OR CAST(parent_sr AS TEXT) LIKE ?)");
            const term = `%${q}%`;
            bindings.push(term, term, term, term, term);
          }

          if (subj && subj !== "All Subjects") {
            whereClauses.push("subject = ?");
            bindings.push(subj);
          }

          if (fmt && fmt !== "All Formats") {
            whereClauses.push("signature_format = ?");
            bindings.push(fmt);
          }

          if (rStatus && rStatus !== "All Statuses") {
            whereClauses.push("research_status = ?");
            bindings.push(rStatus);
          }

          if (status === "available") {
            whereClauses.push("used = 0");
          } else if (status === "used") {
            whereClauses.push("used = 1");
          }

          const whereSql = whereClauses.join(" AND ");

          const countRes = await db.prepare(`SELECT COUNT(*) as total FROM production_pool WHERE ${whereSql}`).bind(...bindings).first();
          const total = countRes?.total || 0;

          const itemsRes = await db.prepare(`
            SELECT * FROM production_pool 
            WHERE ${whereSql} 
            ORDER BY 
              CASE WHEN priority_tier LIKE '%A+%' THEN 1 WHEN priority_tier LIKE '%Tier 1%' THEN 2 ELSE 3 END,
              production_score DESC, 
              idea_id ASC 
            LIMIT ? OFFSET ?
          `).bind(...bindings, pageSize, offset).all();

          return jsonResponse({
            success: true,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            items: (itemsRes.results || []).map(r => ({
              ...r,
              used: !!r.used,
              active: !!r.active,
              brief_available: !!r.brief_available
            }))
          });
        }

        case "get_source_ready_brief":
        case "get_brief": {
          const ideaId = body.idea_id || params.idea_id;
          if (!ideaId) return jsonResponse({ success: false, error: "idea_id required" }, 400);

          const idea = await db.prepare("SELECT * FROM production_pool WHERE idea_id = ?").bind(ideaId).first();
          if (!idea) return jsonResponse({ success: false, error: "Idea not found" }, 404);

          // Check if explicit brief exists in table
          const briefRow = await db.prepare("SELECT * FROM source_ready_briefs WHERE idea_id = ?").bind(ideaId).first();
          if (briefRow) {
            return jsonResponse({ success: true, brief: briefRow });
          }

          // Dynamic brief synthesis fallback
          return jsonResponse({
            success: true,
            brief: {
              idea_id: idea.idea_id,
              title: idea.video_idea,
              overview: `Curated research outline for ${idea.subject} / ${idea.topic_family}. Hook: "${idea.curiosity_hook || idea.video_idea}".`,
              key_points: `1. Core Premise: ${idea.curiosity_hook || idea.video_idea}\n2. Empirical Evidence & Counter-intuitive data points.\n3. Case Studies & Mechanical breakdown (${idea.signature_format}).\n4. Takeaway & Retention Conclusion.`,
              sources: idea.source_family_guidance || "Peer-reviewed journals, institutional archives, verified empirical databases.",
              ready_status: idea.research_status || "Needs Research"
            }
          });
        }

        case "fetch_source_feed": {
          const feedUrl = body.url || params.url;
          if (!feedUrl) return jsonResponse({ success: false, error: "Feed URL is required" }, 400);

          try {
            const feedRes = await fetch(feedUrl, {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, application/json, text/html, */*"
              },
              cf: {
                cacheTtl: 600,
                cacheEverything: true
              }
            });

            if (!feedRes.ok) {
              return jsonResponse({ success: false, status: feedRes.status, error: `Feed responded with status ${feedRes.status}` }, 502);
            }

            const contentType = feedRes.headers.get("content-type") || "";
            const contentText = await feedRes.text();

            return jsonResponse({
              success: true,
              url: feedUrl,
              content_type: contentType,
              data: contentText
            });
          } catch (fetchErr) {
            return jsonResponse({ success: false, error: `Failed to fetch feed: ${fetchErr.message}` }, 500);
          }
        }

        case "add_production_idea": {
          const videoIdea = (body.video_idea || params.video_idea || "").trim();
          if (!videoIdea) return jsonResponse({ success: false, error: "video_idea is required" }, 400);

          const hook = (body.curiosity_hook || params.curiosity_hook || "").trim();
          const format = (body.signature_format || params.signature_format || "SF04 — Case Study Breakdown").trim();
          const subject = (body.subject || params.subject || "General").trim();
          const topicFamily = (body.topic_family || params.topic_family || "General Discoveries").trim();
          const score = parseInt(body.production_score || params.production_score || "88", 10);
          const tier = (body.priority_tier || params.priority_tier || (score >= 90 ? "Tier 1" : "Tier 2")).trim();
          const visDir = (body.visualization_direction || params.visualization_direction || "").trim();
          const srcGuidance = (body.source_family_guidance || params.source_family_guidance || "").trim();
          let parentSr = parseInt(body.parent_sr || params.parent_sr || "0", 10);

          // If no parent_sr, look for an existing taxonomy seed matching subject/topic, or use 1
          if (!parentSr || parentSr <= 0) {
            const taxMatch = await db.prepare("SELECT sr FROM master_taxonomy WHERE subject = ? LIMIT 1").bind(subject).first();
            parentSr = taxMatch?.sr || 1;
          }

          // Get next KS-P-XXXX ID
          const lastKsp = await db.prepare("SELECT idea_id FROM production_pool WHERE idea_id LIKE 'KS-P-%' ORDER BY idea_id DESC LIMIT 1").first();
          let nextNum = 1;
          if (lastKsp && lastKsp.idea_id) {
            const parts = lastKsp.idea_id.split("-");
            const lastVal = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(lastVal)) {
              nextNum = lastVal + 1;
            }
          }
          const ideaId = `KS-P-${String(nextNum).padStart(4, '0')}`;
          const now = new Date().toISOString();
          const notes = `Ingested via Discovery Lab from ${srcGuidance ? srcGuidance.slice(0, 50) : 'Publication Feed'}.`;

          await db.batch([
            db.prepare(`
              INSERT INTO production_pool (
                idea_id, parent_sr, subtopic_seed, subject, topic_family, signature_format,
                video_idea, curiosity_hook, visualization_direction, source_family_guidance,
                freshness_class, research_status, used, times_shown, production_score,
                priority_tier, notes, active, brief_available
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Recent Publication', 'Ready', 0, 0, ?, ?, ?, 1, 0)
            `).bind(
              ideaId, parentSr, videoIdea, subject, topicFamily, format,
              videoIdea, hook, visDir, srcGuidance, score, tier, notes
            ),
            db.prepare("INSERT INTO app_events (event_id, event_type, request_id, payload, created_at) VALUES (?, 'add_production_idea', ?, ?, ?)")
              .bind(`evt_${Date.now()}`, requestId, JSON.stringify({ idea_id: ideaId, video_idea: videoIdea, subject }), now)
          ]);

          return jsonResponse({
            success: true,
            idea_id: ideaId,
            video_idea: videoIdea,
            curiosity_hook: hook,
            subject,
            topic_family: topicFamily,
            signature_format: format,
            production_score: score,
            priority_tier: tier,
            used: false,
            times_shown: 0,
            active: true
          });
        }

        default:
          return jsonResponse({ success: false, error: `Unknown action: ${action}` }, 400);
      }
    } catch (err) {
      return jsonResponse({ success: false, error: err.message || String(err) }, 500);
    }
  }
};

async function generateBatchInternal(db, mode, size, subjectFilter, requestId, config = {}) {
  const today = getKarachiDateString();
  const now = new Date().toISOString();
  const batchId = `BATCH-${today.replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  let querySql = "SELECT * FROM production_pool WHERE used = 0 AND active = 1 AND LOWER(research_status) != 'hold'";
  let bindings = [];

  if (subjectFilter) {
    if (Array.isArray(subjectFilter) && subjectFilter.length > 0) {
      querySql += ` AND subject IN (${subjectFilter.map(() => '?').join(',')})`;
      bindings.push(...subjectFilter);
    } else if (typeof subjectFilter === 'string' && subjectFilter !== 'All Subjects') {
      querySql += " AND subject = ?";
      bindings.push(subjectFilter);
    }
  }

  if (mode === "DISCOVERY") {
    querySql += " ORDER BY times_shown ASC, production_score DESC, RANDOM() LIMIT 200";
  } else if (mode === "REVISIT_UNUSED") {
    querySql += " AND times_shown > 0 ORDER BY times_shown DESC, production_score DESC, RANDOM() LIMIT 200";
  } else if (mode === "RANDOM") {
    querySql += " ORDER BY RANDOM() LIMIT 200";
  } else {
    // BALANCED
    querySql += " ORDER BY times_shown ASC, production_score DESC, RANDOM() LIMIT 250";
  }

  const eligibleRes = await db.prepare(querySql).bind(...bindings).all();
  const eligible = eligibleRes.results || [];

  if (eligible.length === 0) {
    return jsonResponse({ success: false, error: "No eligible ideas found in Production Pool" }, 404);
  }

  // Enforce max same subject balance from config
  const selected = [];
  const subjectCounts = {};
  const maxPerSubject = subjectFilter ? size : (config.max_same_subject || 2);

  for (const item of eligible) {
    if (selected.length >= size) break;
    const sub = item.subject || "General";
    const current = subjectCounts[sub] || 0;
    if (current < maxPerSubject) {
      selected.push(item);
      subjectCounts[sub] = current + 1;
    }
  }

  // If we couldn't fill size due to subject constraints, fill remaining from eligible
  if (selected.length < size) {
    for (const item of eligible) {
      if (selected.length >= size) break;
      if (!selected.some(s => s.idea_id === item.idea_id)) {
        selected.push(item);
      }
    }
  }

  // Insert into app_batches and app_batch_items
  const batchStatements = [
    db.prepare("INSERT INTO app_batches (batch_id, date, selection_mode, requested_size, subject_filter, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(batchId, today, mode, size, typeof subjectFilter === 'string' ? subjectFilter : null, now)
  ];

  const items = selected.map((item, idx) => {
    const batchItemId = `BI-${batchId}-${idx + 1}`;
    batchStatements.push(
      db.prepare("INSERT INTO app_batch_items (batch_item_id, batch_id, idea_id, position, status, selected_at) VALUES (?, ?, ?, ?, 'shown', ?)")
        .bind(batchItemId, batchId, item.idea_id, idx + 1, now),
      db.prepare("UPDATE production_pool SET times_shown = times_shown + 1, last_shown = ? WHERE idea_id = ?")
        .bind(now, item.idea_id)
    );

    return {
      batch_item_id: batchItemId,
      batch_id: batchId,
      idea_id: item.idea_id,
      position: idx + 1,
      status: "shown",
      selected_at: now,
      idea: {
        ...item,
        used: !!item.used,
        active: !!item.active,
        brief_available: !!item.brief_available
      }
    };
  });

  batchStatements.push(
    db.prepare("INSERT INTO app_events (event_id, event_type, request_id, payload, created_at) VALUES (?, 'generate_batch', ?, ?, ?)")
      .bind(`evt_${Date.now()}`, requestId, JSON.stringify({ batch_id: batchId, mode, size, count: items.length }), now)
  );

  await db.batch(batchStatements);

  return jsonResponse({
    success: true,
    is_new: true,
    batch: {
      batch_id: batchId,
      date: today,
      selection_mode: mode,
      requested_size: size,
      created_at: now,
      items
    }
  });
}

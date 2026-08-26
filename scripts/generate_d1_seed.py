import json

def sql_escape(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "1" if val else "0"
    if isinstance(val, (int, float)):
        return str(val)
    # escape single quotes
    s = str(val).replace("'", "''")
    return f"'{s}'"

with open('data/canonical_production_pool.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f"Loaded {len(items)} items.")

batch_size = 100
sql_batches = []

for i in range(0, len(items), batch_size):
    chunk = items[i:i+batch_size]
    values_list = []
    for it in chunk:
        values = (
            sql_escape(it.get('idea_id')),
            sql_escape(it.get('parent_sr')),
            sql_escape(it.get('subtopic_seed')),
            sql_escape(it.get('subject')),
            sql_escape(it.get('topic_family')),
            sql_escape(it.get('signature_format')),
            sql_escape(it.get('video_idea')),
            sql_escape(it.get('curiosity_hook')),
            sql_escape(it.get('visualization_direction')),
            sql_escape(it.get('source_family_guidance')),
            sql_escape(it.get('freshness_class', 'Evergreen')),
            sql_escape(it.get('research_status', 'Ready')),
            1 if it.get('used') else 0,
            sql_escape(it.get('used_date')),
            int(it.get('times_shown', 0)),
            sql_escape(it.get('last_shown')),
            int(it.get('production_score', 82)),
            sql_escape(it.get('priority_tier', 'Tier 2')),
            sql_escape(it.get('notes')),
            0 if str(it.get('active', True)).lower() == 'false' else 1,
            sql_escape(it.get('hold_reason')),
            1 if it.get('brief_available') else 0
        )
        values_list.append(f"({', '.join(map(str, values))})")

    sql = f"INSERT OR REPLACE INTO production_pool (idea_id, parent_sr, subtopic_seed, subject, topic_family, signature_format, video_idea, curiosity_hook, visualization_direction, source_family_guidance, freshness_class, research_status, used, used_date, times_shown, last_shown, production_score, priority_tier, notes, active, hold_reason, brief_available) VALUES\n" + ",\n".join(values_list) + ";"
    sql_batches.append(sql)

with open('data/d1_seed_batches.json', 'w', encoding='utf-8') as f:
    json.dump(sql_batches, f, indent=2)

print(f"Generated {len(sql_batches)} SQL batches (100 rows each) saved to data/d1_seed_batches.json.")

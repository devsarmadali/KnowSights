"""
KnowSights Database Expansion CLI
Safely expands Master Taxonomy and Production Pool in Cloudflare D1 (and Google Sheets)
without disturbing existing ideas or breaking lineage.

Usage:
  python scripts/expand_database.py new-seed --subject "Space & Astronomy" --topic "Exoplanet Atmospheres" --subtopic "How transmission spectroscopy detects atmospheric water on distant worlds"
  python scripts/expand_database.py new-angles --parent-sr 3044 --angles-json "data/new_angles.json"
  python scripts/expand_database.py bulk-import --file "data/new_batch.json"
  python scripts/expand_database.py export-csv
"""

import os
import sys
import json
import argparse
import requests
import time

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

ACCOUNT_ID = "119111ece66b85e5b193ffaf5f14222f"
DB_UUID = "aeea8b1e-1c49-432a-811e-f4460c51a5af"
TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN")

def execute_d1_query(sql, params=None):
    if not TOKEN:
        raise ValueError("CLOUDFLARE_API_TOKEN is required in environment.")
    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/d1/database/{DB_UUID}/query"
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {"sql": sql}
    if params:
        payload["params"] = params
    
    res = requests.post(url, headers=headers, json=payload, timeout=30)
    data = res.json()
    if not data.get("success"):
        raise RuntimeError(f"D1 Query Failed: {data.get('errors')}")
    return data.get("result", [{}])[0].get("results", [])

def get_next_taxonomy_sr():
    res = execute_d1_query("SELECT MAX(sr) as max_sr FROM master_taxonomy;")
    current_max = res[0].get("max_sr") or 0
    return current_max + 1

def get_next_ksp_number():
    res = execute_d1_query("SELECT idea_id FROM production_pool WHERE idea_id LIKE 'KS-P-%' ORDER BY idea_id DESC LIMIT 1;")
    if not res or not res[0].get("idea_id"):
        return 1
    last_id = res[0]["idea_id"] # e.g. KS-P-0180
    num_part = int(last_id.split("-")[-1])
    return num_part + 1

def add_new_seed(subject, topic, subtopic, format_name="SF01 — Hidden System", hook=None):
    next_sr = get_next_taxonomy_sr()
    idea_id = f"KS-T-{str(next_sr).padStart(6, '0') if hasattr(str(next_sr), 'padStart') else str(next_sr).zfill(6)}"
    
    if not hook:
        hook = f"What is the most surprising, counterintuitive or useful insight hidden inside: {subtopic}?"

    print(f"Creating Master Taxonomy Seed #{next_sr}: {subject} > {topic} > {subtopic}")
    
    # 1. Insert into master_taxonomy
    execute_d1_query(
        "INSERT INTO master_taxonomy (sr, subject, topic, subtopic) VALUES (?, ?, ?, ?);",
        [next_sr, subject, topic, subtopic]
    )
    
    # 2. Insert baseline into production_pool
    notes = f"Taxonomy-ready baseline linked to Master Taxonomy Sr. {next_sr}. Ready for research."
    execute_d1_query(
        """
        INSERT INTO production_pool (
          idea_id, parent_sr, subtopic_seed, subject, topic_family, signature_format,
          video_idea, curiosity_hook, freshness_class, research_status,
          used, times_shown, production_score, priority_tier, notes, active, brief_available
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Evergreen', 'Needs Research', 0, 0, 82, 'Tier 2', ?, 1, 0);
        """,
        [idea_id, next_sr, subtopic, subject, topic, format_name, subtopic, hook, notes]
    )
    
    print(f"✅ Success! Added Master Taxonomy Sr. {next_sr} and Baseline Idea {idea_id} to Cloudflare D1.")
    return {"sr": next_sr, "idea_id": idea_id}

def add_editorial_angles(parent_sr, angles):
    # Verify parent seed
    parent_res = execute_d1_query("SELECT * FROM master_taxonomy WHERE sr = ?;", [parent_sr])
    if not parent_res:
        raise ValueError(f"Parent Sr. {parent_sr} not found in Master Taxonomy.")
    
    seed = parent_res[0]
    next_ksp = get_next_ksp_number()
    created = []

    for idx, angle in enumerate(angles):
        ksp_num = next_ksp + idx
        idea_id = f"KS-P-{str(ksp_num).zfill(4)}"
        video_idea = angle.get("video_idea")
        hook = angle.get("curiosity_hook", f"Surprising angle on {seed['subtopic']}")
        fmt = angle.get("signature_format", "SF04 — Case Study Breakdown")
        score = int(angle.get("production_score", 90))
        tier = angle.get("priority_tier", "Tier 1")
        vis_dir = angle.get("visualization_direction", "")
        src_guidance = angle.get("source_family_guidance", "")
        notes = f"Curated editorial angle linked to Master Taxonomy Sr. {parent_sr} ({seed['subtopic']})."

        execute_d1_query(
            """
            INSERT INTO production_pool (
              idea_id, parent_sr, subtopic_seed, subject, topic_family, signature_format,
              video_idea, curiosity_hook, visualization_direction, source_family_guidance,
              freshness_class, research_status, used, times_shown, production_score,
              priority_tier, notes, active, brief_available
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Evergreen', 'Needs Research', 0, 0, ?, ?, ?, 1, 0);
            """,
            [
                idea_id, parent_sr, seed['subtopic'], seed['subject'], seed['topic'],
                fmt, video_idea, hook, vis_dir, src_guidance, score, tier, notes
            ]
        )
        created.append(idea_id)
        print(f"  + Added Editorial Idea {idea_id}: {video_idea} (Parent Sr. {parent_sr})")

    print(f"✅ Success! Created {len(created)} editorial ideas for Parent Sr. {parent_sr}.")
    return created

def main():
    parser = argparse.ArgumentParser(description="KnowSights Database Expansion CLI")
    subparsers = parser.add_subparsers(dest="command")

    # new-seed
    p_seed = subparsers.add_parser("new-seed", help="Add a new Master Taxonomy seed and baseline idea")
    p_seed.add_argument("--subject", required=True, help="Subject discipline name")
    p_seed.add_argument("--topic", required=True, help="Topic family name")
    p_seed.add_argument("--subtopic", required=True, help="Specific subtopic statement")
    p_seed.add_argument("--format", default="SF01 — Hidden System", help="Signature format")
    p_seed.add_argument("--hook", default=None, help="Curiosity hook")

    # new-angles
    p_angles = subparsers.add_parser("new-angles", help="Add editorial angles for an existing parent seed")
    p_angles.add_argument("--parent-sr", type=int, required=True, help="Parent Taxonomy Sr.")
    p_angles.add_argument("--angles-json", required=True, help="Path to JSON file containing array of angle objects")

    # status
    subparsers.add_parser("status", help="Display current database stats from Cloudflare D1")

    args = parser.parse_args()

    if args.command == "status":
        tax_count = execute_d1_query("SELECT COUNT(*) as c FROM master_taxonomy;")[0]["c"]
        pool_count = execute_d1_query("SELECT COUNT(*) as c, SUM(CASE WHEN used = 1 THEN 1 ELSE 0 END) as u FROM production_pool;")[0]
        ksp_count = execute_d1_query("SELECT COUNT(*) as c FROM production_pool WHERE idea_id LIKE 'KS-P-%';")[0]["c"]
        kst_count = execute_d1_query("SELECT COUNT(*) as c FROM production_pool WHERE idea_id LIKE 'KS-T-%';")[0]["c"]
        
        print("\n=== KnowSights Cloudflare D1 Status ===")
        print(f"Master Taxonomy Seeds: {tax_count}")
        print(f"Production Pool Total: {pool_count['c']} (Available: {pool_count['c'] - pool_count['u']}, Used: {pool_count['u']})")
        print(f"  ├─ Curated Signature Ideas (KS-P-*): {ksp_count}")
        print(f"  └─ Baseline Taxonomy Ideas (KS-T-*): {kst_count}")
        print(f"Database UUID: {DB_UUID}\n")

    elif args.command == "new-seed":
        add_new_seed(args.subject, args.topic, args.subtopic, args.format, args.hook)

    elif args.command == "new-angles":
        with open(args.angles_json, 'r', encoding='utf-8') as f:
            angles = json.load(f)
        add_editorial_angles(args.parent_sr, angles)

    else:
        parser.print_help()

if __name__ == "__main__":
    main()

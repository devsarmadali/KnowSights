import os
import requests
import json

account_id = "119111ece66b85e5b193ffaf5f14222f"
db_uuid = "aeea8b1e-1c49-432a-811e-f4460c51a5af"
token = os.environ.get("CLOUDFLARE_API_TOKEN")

if not token:
    print("CLOUDFLARE_API_TOKEN not found in environment.")
    exit(1)

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}
url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/d1/database/{db_uuid}/query"

ddl_statements = [
    """
    CREATE TABLE IF NOT EXISTS user_notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT DEFAULT 'General',
        tags TEXT DEFAULT '[]',
        badge TEXT DEFAULT 'Note',
        is_pinned INTEGER DEFAULT 0,
        version INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS user_note_versions (
        version_id TEXT PRIMARY KEY,
        note_id TEXT NOT NULL,
        version_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT,
        tags TEXT,
        badge TEXT,
        change_summary TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY(note_id) REFERENCES user_notes(id) ON DELETE CASCADE
    );
    """,
    "CREATE INDEX IF NOT EXISTS idx_user_notes_updated ON user_notes(updated_at DESC);",
    "CREATE INDEX IF NOT EXISTS idx_user_notes_pinned ON user_notes(is_pinned DESC, updated_at DESC);",
    "CREATE INDEX IF NOT EXISTS idx_user_note_versions_note ON user_note_versions(note_id, version_number DESC);"
]

print(f"Creating user_notes and user_note_versions in Cloudflare D1 ({db_uuid})...")

for idx, stmt in enumerate(ddl_statements):
    res = requests.post(url, headers=headers, json={"sql": stmt.strip()})
    data = res.json()
    if data.get("success"):
        print(f"Statement {idx+1}/{len(ddl_statements)}: Success")
    else:
        print(f"Statement {idx+1}/{len(ddl_statements)}: Failed ->", data.get("errors"))

# Verify tables exist
verify_res = requests.post(url, headers=headers, json={"sql": "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('user_notes', 'user_note_versions');"})
print("Verified Tables in D1:", json.dumps(verify_res.json().get("result", []), indent=2))

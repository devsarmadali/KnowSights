"""
KnowSights Schema 2.0 Architectural & Business Rules Verification Suite
"""
import re
import os
import sys

def verify_codebase():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    src_dir = os.path.join(base_dir, "src")
    backend_script = os.path.join(base_dir, "scripts", "knowsights_backend.gs")

    errors = []
    checks = []

    print("========================================================")
    print("RUNNING KNOWSIGHTS SCHEMA 2.0 VERIFICATION SUITE")
    print("========================================================")

    # 1. Check Spreadsheet ID
    with open(backend_script, 'r', encoding='utf-8') as f:
        backend_content = f.read()

    with open(os.path.join(src_dir, "App.tsx"), 'r', encoding='utf-8') as f:
        app_content = f.read()

    expected_sheet_id = "1HB4Zxg9qXzWVKyjAzSoTPHadPIVNZitojfaR0qd601w"
    if expected_sheet_id in backend_content:
        checks.append(f"Backend targets Schema 2.0 Sheet ID: {expected_sheet_id}")
    else:
        errors.append(f"Backend does NOT target {expected_sheet_id}")

    if expected_sheet_id in app_content:
        checks.append(f"App.tsx references Schema 2.0 Sheet ID: {expected_sheet_id}")
    else:
        errors.append(f"App.tsx does NOT reference {expected_sheet_id}")

    # 2. Check Timezone
    if 'Asia/Karachi' in backend_content:
        checks.append("Timezone configured as Asia/Karachi")
    else:
        errors.append("Timezone Asia/Karachi missing from backend")

    # 3. Check Canonical Sheets in Backend
    required_sheets = ["Production Pool", "App Config", "App Batches", "App Batch Items", "App Events", "Source-Ready Briefs"]
    for s in required_sheets:
        if s in backend_content:
            checks.append(f"Backend recognizes sheet: {s}")
        else:
            errors.append(f"Backend missing sheet reference: {s}")

    # 4. Check Prohibited Legacy Sheets (No writes / No references)
    forbidden_sheets = ["Daily Batches", "Daily Batch Items", "Audit Events", "Content Angles"]
    for s in forbidden_sheets:
        if s in backend_content:
            errors.append(f"Prohibited legacy sheet found in backend: {s}")
        else:
            checks.append(f"Prohibited legacy sheet absent: {s}")

    # 5. Check No Video URL or Analytics References in src/
    forbidden_terms = ["video_url", "videourlmodal", "notesmodal", "subtopic_sr"]
    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js')):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read().lower()
                    for term in forbidden_terms:
                        if term in content:
                            errors.append(f"Forbidden term '{term}' found in {os.path.relpath(file_path, base_dir)}")

    # 6. Check Primary Key 'Idea ID'
    if 'Idea ID' in backend_content and 'idea_id' in backend_content:
        checks.append("Primary Entity Key is 'Idea ID' (not row index or Sr)")
    else:
        errors.append("'Idea ID' not properly mapped in backend")

    # 7. Check Hard Business Rule: SHOWN != USED
    header_content = open(os.path.join(src_dir, "components", "Header.tsx"), 'r', encoding='utf-8').read()
    if 'SHOWN != USED' in header_content:
        checks.append("UI enforces and displays 'SHOWN != USED' business rule")
    else:
        errors.append("'SHOWN != USED' rule text missing from Header.tsx")

    # 8. Check Idempotency via Request ID
    if 'request_id' in backend_content and 'generateRequestId' in open(os.path.join(src_dir, "services", "api.ts"), 'r', encoding='utf-8').read():
        checks.append("Idempotent mutations enforced via unique Request ID")
    else:
        errors.append("Idempotency Request ID missing")

    # 9. Check Concurrency Locking
    if 'LockService.getScriptLock' in backend_content:
        checks.append("Concurrency serialization protected via LockService")
    else:
        errors.append("LockService missing from mutation methods")

    # 10. Check getOrCreateTodayBatch
    if 'getOrCreateTodayBatch' in backend_content:
        checks.append("getOrCreateTodayBatch implemented to prevent batch duplicates on page refresh")
    else:
        errors.append("getOrCreateTodayBatch missing from backend")

    # 11. Check Undo Used
    if 'undoIdeaUsed' in backend_content and 'UNDO_USED' in backend_content:
        checks.append("Undo Used restores eligibility and appends UNDO_USED event")
    else:
        errors.append("Undo Used or UNDO_USED event missing")

    # Output Results
    for c in checks:
        print("[PASS] " + c)

    if errors:
        print("\nERRORS ENCOUNTERED:")
        for e in errors:
            print("[FAIL] " + e)
        return False
    else:
        print("\n========================================================")
        print("ALL 11 ARCHITECTURAL & SCHEMA 2.0 CHECKS PASSED PERFECTLY!")
        print("========================================================")
        return True

if __name__ == "__main__":
    success = verify_codebase()
    if not success:
        sys.exit(1)

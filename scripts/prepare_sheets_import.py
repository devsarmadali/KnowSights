import os
import glob
import csv
import json
import re

DOWNLOADS_DIR = r"C:\Users\ETIVE\Downloads"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def normalize(text):
    if not text:
        return ""
    return re.sub(r"\s+", " ", str(text).strip())

def parse_csv(filepath):
    rows = []
    with open(filepath, "r", encoding="utf-8-sig", errors="replace") as f:
        reader = csv.reader(f)
        header = next(reader, None)
        if not header:
            return rows
        
        headers = [h.strip().lower() for h in header]
        sr_idx = next((i for i, h in enumerate(headers) if h in ["sr.", "sr", "serial", "id"]), 0)
        sub_idx = next((i for i, h in enumerate(headers) if "subject" in h), 1)
        top_idx = next((i for i, h in enumerate(headers) if "topic" in h and "sub" not in h), 2)
        subtop_idx = next((i for i, h in enumerate(headers) if "subtopic" in h or "sub_topic" in h), 3)

        for line in reader:
            if not line:
                continue
            sr = line[sr_idx] if sr_idx < len(line) else ""
            subj = normalize(line[sub_idx] if sub_idx < len(line) else "")
            top = normalize(line[top_idx] if top_idx < len(line) else "")
            subtop = normalize(line[subtop_idx] if subtop_idx < len(line) else "")

            if subj and top and subtop:
                rows.append({"sr": sr, "subject": subj, "topic": top, "subtopic": subtop})
    return rows

def parse_md_table(filepath, default_subject):
    rows = []
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line.startswith("|") or "---" in line or "Sr." in line:
                continue
            cols = [normalize(c) for c in line.split("|") if c.strip()]
            if len(cols) >= 3:
                sr = cols[0]
                if len(cols) >= 4:
                    subj = cols[1] or default_subject
                    top = cols[2]
                    subtop = cols[3]
                else:
                    subj = default_subject
                    top = cols[1]
                    subtop = cols[2]
                if top and subtop:
                    rows.append({"sr": sr, "subject": subj, "topic": top, "subtopic": subtop})
    return rows

def main():
    print(f"Scanning taxonomy files in: {DOWNLOADS_DIR}")
    files = glob.glob(os.path.join(DOWNLOADS_DIR, "*taxonomy*.csv")) + glob.glob(os.path.join(DOWNLOADS_DIR, "*taxonomy*.md"))
    
    all_rows = []
    seen_keys = set()
    duplicates_count = 0

    for f in sorted(files):
        fname = os.path.basename(f)
        if f.endswith(".csv"):
            parsed = parse_csv(f)
        elif f.endswith(".md"):
            subj_guess = "Physics" if "physics" in fname.lower() else "Economics" if "economics" in fname.lower() else "General Knowledge"
            parsed = parse_md_table(f, subj_guess)
        else:
            continue

        added = 0
        for r in parsed:
            key = f"{r['subject'].lower()}|{r['topic'].lower()}|{r['subtopic'].lower()}"
            if key in seen_keys:
                duplicates_count += 1
                continue
            seen_keys.add(key)
            all_rows.append(r)
            added += 1
        
        print(f"  * {fname:<60} : {len(parsed):>5} found -> {added:>5} unique added")

    # Sequential re-indexing of source_sr
    for idx, r in enumerate(all_rows):
        r["sr"] = idx + 1

    print("=" * 80)
    print(f"TOTAL UNIQUE TAXONOMY ROWS: {len(all_rows)}")
    print(f"DUPLICATES FILTERED: {duplicates_count}")

    subjects = {}
    for r in all_rows:
        subjects[r["subject"]] = subjects.get(r["subject"], 0) + 1
    print(f"TOTAL DISTINCT SUBJECTS: {len(subjects)}")

    # Write Master JSON
    json_path = os.path.join(OUTPUT_DIR, "master_taxonomy.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_rows, f, indent=2, ensure_ascii=False)
    print(f"Saved Master JSON: {json_path} ({os.path.getsize(json_path) / 1024 / 1024:.2f} MB)")

    # Write CSV for Google Sheets Master Taxonomy Sheet
    csv_path = os.path.join(OUTPUT_DIR, "master_taxonomy_for_google_sheets.csv")
    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Sr.", "Subject", "Topic", "Subtopic", "Used", "Used_At", "Times_Shown", "Last_Shown_At", "Video_URL", "Notes", "Active"])
        for r in all_rows:
            writer.writerow([r["sr"], r["subject"], r["topic"], r["subtopic"], "FALSE", "", 0, "", "", "", "TRUE"])
    print(f"Saved Google Sheets CSV: {csv_path} ({os.path.getsize(csv_path) / 1024 / 1024:.2f} MB)")

    # Write Sample Bundle for Instant Frontend Demonstration
    sample_json_path = os.path.join(OUTPUT_DIR, "sample_taxonomy_bundle.json")
    with open(sample_json_path, "w", encoding="utf-8") as f:
        json.dump({
            "stats": {
                "total_subtopics": len(all_rows),
                "available_subtopics": len(all_rows),
                "used_subtopics": 0,
                "used_percentage": 0,
                "used_today": 0
            },
            "subjects_count": len(subjects),
            "sample_records": all_rows[:2000]
        }, f, indent=2, ensure_ascii=False)
    print(f"Saved Sample Bundle: {sample_json_path}")

if __name__ == "__main__":
    main()

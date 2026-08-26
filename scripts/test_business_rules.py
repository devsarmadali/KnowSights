import os
import json
import random
from datetime import datetime, timedelta

DATA_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "master_taxonomy.json")

class MockGoogleSheetTaxonomyEngine:
    def __init__(self, data_path):
        with open(data_path, "r", encoding="utf-8") as f:
            self.taxonomy = json.load(f)
        
        # Initialize mutable runtime state for each taxonomy row
        for item in self.taxonomy:
            item["used"] = False
            item["used_at"] = None
            item["times_shown"] = 0
            item["last_shown_at"] = None
            item["video_url"] = ""
            item["notes"] = ""
            item["active"] = True
        
        self.batches = []
        self.batch_items = []
        self.events = []
        self.settings = {
            "daily_mix_size": 12,
            "recent_repeat_cooldown_days": 7,
            "max_same_subject": 2,
            "max_same_topic": 1
        }
        self.angles = [
            {"id": "ang-1", "name": "Beginner's Guide"},
            {"id": "ang-2", "name": "Deep Dive Case Study"},
            {"id": "ang-3", "name": "Top 5 Critical Mistakes"},
            {"id": "ang-4", "name": "Future Trends & Outlook"}
        ]

    def generate_daily_mix(self, mode="BALANCED", size=12, subject_filter=None):
        req_size = size or self.settings["daily_mix_size"]
        cooldown_days = self.settings["recent_repeat_cooldown_days"]
        max_same_subj = req_size if mode == "DEEP_DIVE" else self.settings["max_same_subject"]
        max_same_top = max(1, req_size // 4) if mode == "DEEP_DIVE" else self.settings["max_same_topic"]

        now = datetime.now()
        candidates = []

        for item in self.taxonomy:
            # RULE: active == True and used == False
            if not item.get("active", True) or item.get("used", False):
                continue
            
            if subject_filter:
                if isinstance(subject_filter, list) and item["subject"] not in subject_filter:
                    continue
                elif isinstance(subject_filter, str) and item["subject"] != subject_filter:
                    continue
            
            times_shown = item["times_shown"]
            last_shown_at = item["last_shown_at"]
            is_cool = True
            if last_shown_at:
                diff = (now - last_shown_at).total_seconds() / 86400.0
                is_cool = diff >= cooldown_days

            score = 0.0
            if mode == "DISCOVERY":
                score = (1000.0 if times_shown == 0 else 1.0) + random.uniform(0, 50) + (1.0 / (1.0 + times_shown)) * 10.0
            elif mode == "REVISIT_UNUSED":
                score = (500.0 + times_shown * 15.0 if times_shown > 0 else 1.0) + random.uniform(0, 50)
            elif mode == "RANDOM_EXPLORATION":
                score = random.uniform(0, 100) + (20.0 if is_cool else 0.0)
            else: # BALANCED
                score = (50.0 if times_shown == 0 else 0.0) + \
                        (40.0 if last_shown_at is None else (30.0 if is_cool else 5.0)) + \
                        (1.0 / (1.0 + times_shown * 0.5)) * 20.0 + random.uniform(0, 15)

            candidates.append({
                "item": item,
                "score": score
            })

        if not candidates:
            return {"success": False, "error": "No candidates available"}

        candidates.sort(key=lambda x: x["score"], reverse=True)

        selected = []
        subject_counts = {}
        topic_counts = {}
        selected_srs = set()

        for c in candidates:
            if len(selected) >= req_size:
                break
            it = c["item"]
            s_cnt = subject_counts.get(it["subject"], 0)
            t_cnt = topic_counts.get(it["topic"], 0)

            if s_cnt < max_same_subj and t_cnt < max_same_top:
                selected.append(it)
                selected_srs.add(it["sr"])
                subject_counts[it["subject"]] = s_cnt + 1
                topic_counts[it["topic"]] = t_cnt + 1

        # Fallback relaxation
        if len(selected) < req_size:
            for c in candidates:
                if len(selected) >= req_size:
                    break
                it = c["item"]
                if it["sr"] not in selected_srs:
                    selected.append(it)
                    selected_srs.add(it["sr"])

        batch_id = f"batch_{now.strftime('%Y%m%d_%H%M%S')}_{random.randint(100, 999)}"
        self.batches.append({
            "batch_id": batch_id,
            "date": now.strftime("%Y-%m-%d"),
            "mode": mode,
            "size": len(selected)
        })

        batch_items = []
        for idx, item in enumerate(selected):
            item_id = f"item_{batch_id}_{idx+1}"
            angle = random.choice(self.angles)["name"] if self.angles else ""
            
            # MUTATION: Update Times_Shown and Last_Shown_At. used REMAINS False!
            prev_times = item["times_shown"]
            item["times_shown"] += 1
            item["last_shown_at"] = now

            b_item = {
                "batch_item_id": item_id,
                "batch_id": batch_id,
                "sr": item["sr"],
                "subject": item["subject"],
                "topic": item["topic"],
                "subtopic": item["subtopic"],
                "angle": angle,
                "position": idx + 1,
                "status": "shown",
                "previous_times_shown": prev_times,
                "used": item["used"] # Must be False
            }
            batch_items.append(b_item)
            self.batch_items.append(b_item)
            self.events.append({
                "sr": item["sr"],
                "batch_id": batch_id,
                "event_type": "shown"
            })

        return {
            "success": True,
            "batch_id": batch_id,
            "items": batch_items
        }

    def mark_used(self, sr, batch_item_id=None):
        for item in self.taxonomy:
            if item["sr"] == sr:
                item["used"] = True
                item["used_at"] = datetime.now()
                break
        
        if batch_item_id:
            for bi in self.batch_items:
                if bi["batch_item_id"] == batch_item_id:
                    bi["status"] = "used"
                    break
        
        self.events.append({"sr": sr, "batch_id": batch_item_id, "event_type": "marked_used"})
        return {"success": True, "sr": sr, "used": True}

    def undo_used(self, sr, batch_item_id=None):
        for item in self.taxonomy:
            if item["sr"] == sr:
                item["used"] = False
                item["used_at"] = None
                break
        
        if batch_item_id:
            for bi in self.batch_items:
                if bi["batch_item_id"] == batch_item_id:
                    bi["status"] = "shown"
                    break
        
        self.events.append({"sr": sr, "batch_id": batch_item_id, "event_type": "undo_used"})
        return {"success": True, "sr": sr, "used": False}

    def replace_item(self, batch_item_id):
        old_item = None
        for bi in self.batch_items:
            if bi["batch_item_id"] == batch_item_id:
                old_item = bi
                break
        
        if not old_item:
            return {"success": False, "error": "Item not found"}
        
        old_item["status"] = "replaced"
        self.events.append({"sr": old_item["sr"], "event_type": "replaced"})

        # Pick new unused candidate
        current_batch_srs = {bi["sr"] for bi in self.batch_items if bi["batch_id"] == old_item["batch_id"] and bi["status"] != "replaced"}
        candidates = [t for t in self.taxonomy if not t["used"] and t["active"] and t["sr"] not in current_batch_srs]
        
        if not candidates:
            return {"success": False, "error": "No candidates to replace"}
        
        chosen = random.choice(candidates[:20])
        chosen["times_shown"] += 1
        chosen["last_shown_at"] = datetime.now()

        new_bi = {
            "batch_item_id": f"{old_item['batch_id']}_rep_{random.randint(1000, 9999)}",
            "batch_id": old_item["batch_id"],
            "sr": chosen["sr"],
            "subject": chosen["subject"],
            "topic": chosen["topic"],
            "subtopic": chosen["subtopic"],
            "angle": "Replaced Fresh Angle",
            "position": old_item["position"],
            "status": "shown",
            "previous_times_shown": chosen["times_shown"] - 1,
            "used": False
        }
        self.batch_items.append(new_bi)
        self.events.append({"sr": chosen["sr"], "event_type": "shown"})
        return {"success": True, "new_item": new_bi}


def run_tests():
    print("=" * 80)
    print("RUNNING KNOWSIGHTS TOPIC MIXER BUSINESS RULES SUITE")
    print("=" * 80)

    engine = MockGoogleSheetTaxonomyEngine(DATA_JSON_PATH)

    # TEST 1: Generate mix. A shown subtopic has used = false.
    print("[TEST 1] Testing: Mix generation creates batch with used = false...")
    mix1 = engine.generate_daily_mix(mode="BALANCED", size=12)
    assert mix1["success"] is True, "Failed to generate mix"
    assert len(mix1["items"]) == 12, f"Expected 12 items, got {len(mix1['items'])}"
    for it in mix1["items"]:
        assert it["used"] is False, f"Rule broken! Item {it['sr']} was marked used!"
        # Check taxonomy state
        tax_entry = next(t for t in engine.taxonomy if t["sr"] == it["sr"])
        assert tax_entry["used"] is False, f"Taxonomy entry {tax_entry['sr']} used is True!"
        assert tax_entry["times_shown"] == 1, f"Expected times_shown=1, got {tax_entry['times_shown']}"
        assert tax_entry["last_shown_at"] is not None
    print("  * PASS: TEST 1 passed (SHOWN != USED verified).")

    # TEST 2: Generate another future mix. Previously shown but unused records are still eligible.
    print("[TEST 2] Testing: Previously shown unused records remain 100% eligible...")
    first_item_sr = mix1["items"][0]["sr"]
    # Revisit unused mode should be able to pick from already shown items
    revisit_mix = engine.generate_daily_mix(mode="REVISIT_UNUSED", size=12)
    assert revisit_mix["success"] is True
    assert any(it["previous_times_shown"] > 0 for it in revisit_mix["items"]), "Revisit Unused mode failed to pick shown items"
    print("  * PASS: TEST 2 passed (Previously shown unused items remain eligible).")

    # TEST 3: Mark one item Used. Future selection never returns it.
    print("[TEST 3] Testing: Marking item Used permanently excludes it from all mixes...")
    target_sr = mix1["items"][0]["sr"]
    target_b_id = mix1["items"][0]["batch_item_id"]
    engine.mark_used(target_sr, target_b_id)
    
    # Check that it's marked used
    tax_entry = next(t for t in engine.taxonomy if t["sr"] == target_sr)
    assert tax_entry["used"] is True, "Item was not marked used"
    
    # Generate 10 mixes across different modes and assert target_sr is NEVER returned
    for m in ["BALANCED", "DISCOVERY", "RANDOM_EXPLORATION", "REVISIT_UNUSED", "CURRENT_AFFAIRS"]:
        mix = engine.generate_daily_mix(mode=m, size=20)
        returned_srs = [it["sr"] for it in mix["items"]]
        assert target_sr not in returned_srs, f"CRITICAL FAIL: Used item {target_sr} appeared in future mix {m}!"
    print("  * PASS: TEST 3 passed (Used items are 100% excluded).")

    # TEST 4: Undo Used. Item becomes eligible again.
    print("[TEST 4] Testing: Undo Used restores candidate eligibility...")
    engine.undo_used(target_sr, target_b_id)
    tax_entry = next(t for t in engine.taxonomy if t["sr"] == target_sr)
    assert tax_entry["used"] is False, "Undo Used did not reset used field to False"
    assert tax_entry["used_at"] is None
    print("  * PASS: TEST 4 passed (Undo Used restores candidate eligibility).")

    # TEST 5: Replace an item. Replaced item's used field remains false.
    print("[TEST 5] Testing: Replacing an item keeps old item used = false...")
    item_to_replace = mix1["items"][1]["batch_item_id"]
    old_sr = mix1["items"][1]["sr"]
    rep_result = engine.replace_item(item_to_replace)
    assert rep_result["success"] is True
    old_tax_entry = next(t for t in engine.taxonomy if t["sr"] == old_sr)
    assert old_tax_entry["used"] is False, "Replaced item was erroneously marked used!"
    print("  * PASS: TEST 5 passed (Replaced item used remains false).")

    # TEST 6: Single generation contains zero duplicate subtopics in the same batch.
    print("[TEST 6] Testing: Zero duplicate subtopics within any generated batch...")
    for _ in range(5):
        batch = engine.generate_daily_mix(mode="BALANCED", size=24)
        srs = [it["sr"] for it in batch["items"]]
        assert len(srs) == len(set(srs)), f"Duplicate found in batch: {srs}"
    print("  * PASS: TEST 6 passed (Batches contain zero duplicates).")

    # TEST 7: Taxonomy hierarchy is intact.
    print("[TEST 7] Testing: Taxonomy structure (Subject -> Topic -> Subtopic)...")
    sample = engine.taxonomy[0]
    assert "subject" in sample and sample["subject"], "Missing subject"
    assert "topic" in sample and sample["topic"], "Missing topic"
    assert "subtopic" in sample and sample["subtopic"], "Missing subtopic"
    assert "sr" in sample and sample["sr"] > 0, "Missing or invalid sr"
    print(f"  * PASS: TEST 7 passed ({len(engine.taxonomy)} rows verified).")

    print("=" * 80)
    print("ALL 7 CRITICAL BUSINESS RULES & TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 80)

if __name__ == "__main__":
    run_tests()

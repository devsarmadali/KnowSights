#!/usr/bin/env python3
"""
KnowSights Gemini AI Psychology Database Expansion CLI
Autonomously synthesizes high-impact, high-retention psychology topics
across the 8 critical dimensions (Manipulation, Control, System Traps, Status Quo,
Consumerism Manipulation, Social Traps, Social Controls, Sale of Fear).

Usage:
    python scripts/expand_psychology_with_gemini.py --dimension "System Traps & Structural Dynamics" --count 10 --key YOUR_KEY
    python scripts/expand_psychology_with_gemini.py --all-dimensions --count 5
"""

import argparse
import csv
import json
import os
import sys
import urllib.request
import urllib.error

PREFERRED_MODELS = [
    "gemini-2.5-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash",
    "gemini-3-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
]

PSYCHOLOGY_DIMENSIONS = [
    "Psychological Manipulation",
    "Behavioral & Systemic Control",
    "System Traps & Structural Dynamics",
    "Status Quo & System Justification",
    "Consumerism Manipulation",
    "Social Traps & Multipolar Dilemmas",
    "Social Controls & Compliance",
    "Sale of Fear & Threat Monetization"
]

def generate_topics_with_gemini(dimension, count=5, focus=None, api_key=None):
    key = api_key or os.environ.get("GEMINI_API_KEY")
    if not key:
        raise ValueError("Gemini API key is required via --key argument or GEMINI_API_KEY environment variable.")

    focus_clause = f"Special Industry/Domain Focus: {focus}\n" if focus else ""

    prompt = f"""You are KnowSights' Chief Behavioral Psychologist, Systems Architect, and Lead Story Strategist for the 'Wise Wolf vs. Naive Sheep' intellectual entertainment series.

TASK:
Synthesize exactly {count} brand-new, deeply researched, mind-awakening psychological phenomena / systemic mechanisms for our production database.

TARGET CRITICAL DIMENSION:
{dimension}
{focus_clause}

CREATIVE & INTELLECTUAL INVARIANTS:
1. THE NAIVE SHEEP PERSPECTIVE: Represents comfortable conventional wisdom, unquestioning trust in institutional defaults, and internalized self-blame ('I just lack willpower').
2. THE WISE WOLF PERSPECTIVE: Street-smart, razor-sharp critical thinker. Never speaks down from an ivory tower. Follows hidden incentives, asks lethal Socratic questions ('Who profits when you believe this?'), and exposes the invisible levers.
3. GROUNDED IN REALITY: Strip away dry clinical abstractions. Explain the exact mechanism through relatable everyday contexts (workplaces, e-commerce, banking, feeds, relationships).
4. SCHOLARLY RIGOR: Provide realistic, authoritative academic citations or classic foundational books/authors for each topic.

Return a strictly valid JSON array of objects containing exactly {count} items, each with this exact structure:
[
  {{
    "phenomenon": "Name of Phenomenon or Trap",
    "sector": "Choose one of: Cognitive Biases & Decision-Making, Social Influence & Conformity, Crowd & Mass Behavior, Consumer & Pricing Psychology, Corporate Deception & Dark Patterns, Media & Information Psychology, Social Media & Digital Behavior, Workplace & Organizations, Public Behavior & Civic Life, Risk, Fear & Crisis Behavior, Persuasion, Scams & Compliance",
    "category": "High-level category",
    "type": "Mechanism type",
    "subtype": "Specific subtype",
    "definition": "Clear, street-smart 1-sentence definition",
    "mechanism": "The precise underlying psychological/systemic engine",
    "contexts": "3-4 real-world settings separated by semicolons",
    "related": "2-3 related psychological or game-theoretic concepts",
    "awakening_truth": "The paradigm-shattering realization that awakens the viewer",
    "hidden_assumption": "What the naive public unquestioningly assumes",
    "uncomfortable_q": "A lethal Socratic question that unravels the illusion",
    "who_benefits": "The hidden beneficiaries extracting wealth, compliance, or status",
    "who_pays": "The unaware public bearing the real financial or psychological cost",
    "everyday_trigger": "A vivid, relatable everyday scene where someone walks into this trap",
    "myth": "The popular societal misconception",
    "reality_check": "The empirical scientific or systemic reality",
    "shock": 4.5,
    "relatability": 4.8,
    "visualizability": 4.3,
    "sources": ["Author, A. (Year). Title of foundational study or book. Publisher."]
  }}
]"""

    for model in PREFERRED_MODELS:
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.7,
                "responseMimeType": "application/json"
            }
        }
        
        try:
            req = urllib.request.Request(
                endpoint,
                data=json.dumps(payload).encode('utf-8'),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=45) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                raw_text = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                cleaned = raw_text.strip().replace('```json', '').replace('```', '').strip()
                parsed = json.loads(cleaned)
                if isinstance(parsed, list) and len(parsed) > 0:
                    print(f"✅ Generated {len(parsed)} topics successfully via model {model}")
                    for item in parsed:
                        item['dimension'] = dimension
                    return parsed
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode('utf-8', errors='ignore')
            print(f"⚠️ Model {model} failed (HTTP {e.code}): {err_msg[:120]}... trying next model")
            continue
        except Exception as err:
            print(f"⚠️ Model {model} failed: {err}... trying next model")
            continue

    raise RuntimeError("Failed to generate topics across all Gemini models. Check your API key and quota.")

def append_to_csv_and_rebuild(new_topics):
    from build_expansion_master import format_topic_to_csv_row
    from build_psychology_database import main as rebuild_db
    
    csv_path = 'Psychology_Topic_Engine_Master_V6_Consolidated.csv'
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)

    # Determine highest current topic ID
    max_id = 0
    for r in rows:
        tid = r.get('Topic_ID', '')
        if tid.startswith('TOP-'):
            try:
                num = int(tid.replace('TOP-', ''))
                if num > max_id:
                    max_id = num
            except ValueError:
                pass

    new_rows = []
    for i, topic in enumerate(new_topics):
        next_id = max_id + 1 + i
        topic['id'] = f"TOP-{next_id:04d}"
        row = format_topic_to_csv_row(topic, fieldnames)
        new_rows.append(row)

    with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows + new_rows)

    print(f"✅ Appended {len(new_rows)} new topics to {csv_path} (IDs TOP-{max_id+1:04d} to TOP-{max_id+len(new_rows):04d})")
    
    # Rebuild JSON database
    rebuild_db()
    print("✅ Successfully synchronized JSON databases!")

def main():
    parser = argparse.ArgumentParser(description="Expand KnowSights Psychology Database with Gemini AI")
    parser.add_argument("--dimension", default="Psychological Manipulation", choices=PSYCHOLOGY_DIMENSIONS)
    parser.add_argument("--count", type=int, default=5, help="Number of topics to synthesize")
    parser.add_argument("--focus", default=None, help="Optional domain/industry focus prompt")
    parser.add_argument("--key", default=None, help="Gemini API key")
    parser.add_argument("--all-dimensions", action="store_true", help="Generate topics for all 8 dimensions")
    parser.add_argument("--count-per-dimension", type=int, default=3, help="Topics per dimension when --all-dimensions is active")

    args = parser.parse_args()

    if args.all_dimensions:
        print(f"🚀 Launching multi-dimension synthesis across all 8 dimensions ({args.count_per_dimension} each)...")
        all_generated = []
        for dim in PSYCHOLOGY_DIMENSIONS:
            print(f"\n--- Synthesizing dimension: {dim} ---")
            topics = generate_topics_with_gemini(dim, count=args.count_per_dimension, focus=args.focus, api_key=args.key)
            all_generated.extend(topics)
        append_to_csv_and_rebuild(all_generated)
    else:
        print(f"🚀 Synthesizing {args.count} topics for dimension: {args.dimension}...")
        topics = generate_topics_with_gemini(args.dimension, count=args.count, focus=args.focus, api_key=args.key)
        append_to_csv_and_rebuild(topics)

if __name__ == '__main__':
    main()

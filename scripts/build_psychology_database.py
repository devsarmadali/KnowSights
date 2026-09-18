import csv
import json
import os
import sys

def parse_pipe_list(val):
    if not val:
        return []
    return [item.strip() for item in val.split('|') if item.strip()]

def safe_float(val, default=0.0):
    try:
        if val is None or val == '':
            return default
        return float(val)
    except (ValueError, TypeError):
        return default

def safe_int(val, default=0):
    try:
        if val is None or val == '':
            return default
        return int(float(val))
    except (ValueError, TypeError):
        return default

KNOWN_DIMS = [
    'Psychological Manipulation',
    'Behavioral & Systemic Control',
    'System Traps & Structural Dynamics',
    'Status Quo & System Justification',
    'Consumerism Manipulation',
    'Social Traps & Multipolar Dilemmas',
    'Social Controls & Compliance',
    'Sale of Fear & Threat Monetization'
]

def get_dimension(row):
    fam = row.get('Candidate_Angle_Families', '').strip()
    for d in KNOWN_DIMS:
        if d.lower() in fam.lower():
            return d
    
    text = (row.get('Phenomenon', '') + ' ' + row.get('Core_Definition', '') + ' ' + row.get('Keywords', '') + ' ' + row.get('Sector', '')).lower()
    
    if any(k in text for k in ['scam', 'gaslight', 'manipulat', 'deception', 'persuasion', 'dark triad', 'exploit']):
        return 'Psychological Manipulation'
    if any(k in text for k in ['surveillance', 'panopticon', 'dark pattern', 'nudge', 'operant', 'control', 'compliance', 'bureaucracy']):
        return 'Behavioral & Systemic Control'
    if any(k in text for k in ['commons', 'goodhart', 'feedback', 'externalit', 'system trap', 'incentive', 'lock-in', 'economics', 'rebound']):
        return 'System Traps & Structural Dynamics'
    if any(k in text for k in ['status quo', 'system justification', 'meritocracy', 'just-world', 'fatalism', 'inertia', 'tradition', 'inevitab']):
        return 'Status Quo & System Justification'
    if any(k in text for k in ['consumer', 'pricing', 'hedonic', 'fomo', 'debt', 'fashion', 'retail', 'brand', 'subscription', 'obsolescence']):
        return 'Consumerism Manipulation'
    if any(k in text for k in ['multipolar', 'crab', 'pluralistic', 'bystander', 'echo chamber', 'scapegoat', 'arms race', 'crowd']):
        return 'Social Traps & Multipolar Dilemmas'
    if any(k in text for k in ['consent', 'overton', 'tone policing', 'shame', 'spiral of silence', 'propaganda', 'chilling', 'carceral']):
        return 'Social Controls & Compliance'
    if any(k in text for k in ['fear', 'threat', 'panic', 'terror', 'anxiety', 'security theater', 'prepper', 'phobia', 'fud', 'risk']):
        return 'Sale of Fear & Threat Monetization'
        
    sec = row.get('Sector', '')
    if 'Corporate Deception' in sec: return 'Behavioral & Systemic Control'
    if 'Consumer & Pricing' in sec: return 'Consumerism Manipulation'
    if 'Persuasion' in sec: return 'Psychological Manipulation'
    if 'Risk' in sec or 'Fear' in sec: return 'Sale of Fear & Threat Monetization'
    if 'Social Influence' in sec: return 'Social Controls & Compliance'
    if 'Crowd' in sec: return 'Social Traps & Multipolar Dilemmas'
    if 'Public Behavior' in sec: return 'Status Quo & System Justification'
    if 'Behavioral Economics' in sec: return 'System Traps & Structural Dynamics'
    if 'Workplace' in sec: return 'Behavioral & Systemic Control'
    if 'Social Media' in sec: return 'Behavioral & Systemic Control'
    return 'Psychological Manipulation'

def main():
    csv_path = 'Psychology_Topic_Engine_Master_V6_Consolidated.csv'
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        sys.exit(1)

    out_dirs = ['public/data', 'data']
    for d in out_dirs:
        os.makedirs(d, exist_ok=True)

    topics = []
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader):
            topic_id = row.get('Topic_ID', f'TOP-{idx+1:03d}').strip()
            phenomenon = row.get('Phenomenon', '').strip()
            sector = row.get('Sector', 'General Psychology').strip()
            category = row.get('Category', '').strip()
            topic_type = row.get('Type', '').strip()
            subtype = row.get('Subtype', '').strip()
            dimension = get_dimension(row)

            # Definition & Mechanism
            definition = row.get('Core_Definition', '').strip()
            mechanism = row.get('Core_Mechanism', '').strip()
            contexts = row.get('Typical_Contexts', '').strip()
            related = row.get('Related_Concepts', '').strip()
            audience = row.get('Primary_Audience', 'General public').strip()
            role_tag = row.get('Role_Tag', '').strip()

            # Editorial & Framing
            angle = row.get('Primary_Angle', '').strip()
            lens = row.get('Emotional_Lens', '').strip()
            awakening_prompt = row.get('Awakening_Prompt', '').strip()
            question_seed = row.get('Question_Seed', '').strip()
            story_seed = row.get('Story_Seed', '').strip()

            # Awakening & Tension Seeds
            awakening_truth = row.get('Awakening_Truth_Seed', '').strip()
            hidden_assumption = row.get('Hidden_Assumption', '').strip()
            uncomfortable_q = row.get('Uncomfortable_Question', '').strip()
            who_benefits = row.get('Who_Benefits_or_Gains', '').strip()
            who_pays = row.get('Who_Pays_or_Bears_Cost', '').strip()
            everyday_trigger = row.get('Everyday_Trigger', '').strip()
            myth_seed = row.get('Myth_Seed', '').strip()
            reality_check_seed = row.get('Reality_Check_Seed', '').strip()
            surprise_type = row.get('Surprise_Type', '').strip()

            # Research & Evidence
            research_status = row.get('Research_Status', '').strip()
            evidence_strength = row.get('Evidence_Strength', '').strip()
            controversy = row.get('Controversy_Level', 'Low').strip()
            sensitivity = row.get('Sensitivity', 'Standard').strip()
            verification_note = row.get('Verification_Note', '').strip()
            
            raw_sources = [
                row.get('Primary_Verified_Source', '').strip(),
                row.get('Source_1', '').strip(),
                row.get('Source_2', '').strip()
            ]
            # Deduplicate non-empty sources
            sources = []
            for s in raw_sources:
                if s and s not in sources:
                    sources.append(s)

            verified_count = safe_int(
                row.get('Verified_Source_Count_Materialized') or 
                row.get('Verified_Source_Count') or 
                len(sources)
            )

            # Scores (1-5 scale)
            shock = safe_float(row.get('Shock_Potential_1_5'), 3.0)
            relatability = safe_float(row.get('Relatability_1_5'), 3.5)
            visualizability = safe_float(row.get('Visualizability_1_5'), 3.0)
            comment_potential = safe_float(row.get('Comment_Potential_1_5'), 3.0)
            sensationalism_risk = safe_float(row.get('Sensationalism_Risk_1_5'), 1.0)
            
            # Prompts and guardrails
            safe_claim_note = row.get('Safe_Claim_Note', '').strip()
            primary_prompt = row.get('Primary_Generation_Prompt', '').strip()

            # Candidate arrays
            candidate_angles = parse_pipe_list(row.get('Candidate_Angles', ''))
            candidate_questions = parse_pipe_list(row.get('Candidate_Question_Templates', ''))
            candidate_hooks = parse_pipe_list(row.get('Candidate_Hook_Templates', ''))
            candidate_endings = parse_pipe_list(row.get('Candidate_Ending_Templates', ''))
            candidate_perspectives = parse_pipe_list(row.get('Candidate_Perspectives', ''))
            candidate_stakeholders = parse_pipe_list(row.get('Candidate_Stakeholders', ''))
            candidate_scenes = parse_pipe_list(row.get('Candidate_Scenes', ''))
            candidate_visuals = parse_pipe_list(row.get('Candidate_Visual_Presets', ''))
            candidate_ethics = parse_pipe_list(row.get('Candidate_Ethical_Tensions', ''))
            candidate_series = parse_pipe_list(row.get('Candidate_Series_Names', ''))
            candidate_recipes = parse_pipe_list(row.get('Candidate_Angle_Recipes', ''))
            candidate_seeds = parse_pipe_list(row.get('Candidate_Awakening_Seeds', ''))
            candidate_engagement_triggers = parse_pipe_list(row.get('Candidate_Engagement_Triggers', ''))
            candidate_engagement_goals = parse_pipe_list(row.get('Candidate_Engagement_Goals', ''))
            candidate_psychographics = parse_pipe_list(row.get('Candidate_Psychographic_Profiles', ''))
            audience_guardrails = parse_pipe_list(row.get('Audience_Guardrails', ''))
            audience_guidance = row.get('Audience_Guidance', '').strip()

            topics.append({
                'id': topic_id,
                'phenomenon': phenomenon,
                'sector': sector,
                'category': category,
                'type': topic_type,
                'subtype': subtype,
                'dimension': dimension,
                'definition': definition,
                'mechanism': mechanism,
                'contexts': contexts,
                'related': related,
                'audience': audience,
                'role_tag': role_tag,
                'angle': angle,
                'lens': lens,
                'prompt': awakening_prompt,
                'question': question_seed,
                'story': story_seed,
                'awakening_truth': awakening_truth,
                'hidden_assumption': hidden_assumption,
                'uncomfortable_q': uncomfortable_q,
                'who_benefits': who_benefits,
                'who_pays': who_pays,
                'everyday_trigger': everyday_trigger,
                'myth': myth_seed,
                'reality_check': reality_check_seed,
                'surprise_type': surprise_type,
                'status': research_status,
                'evidence': evidence_strength,
                'controversy': controversy,
                'sensitivity': sensitivity,
                'verification': verification_note,
                'sources': sources,
                'verified_count': verified_count,
                'shock': shock,
                'relatability': relatability,
                'visualizability': visualizability,
                'comment_potential': comment_potential,
                'sensationalism_risk': sensationalism_risk,
                'safe_claim_note': safe_claim_note,
                'primary_prompt': primary_prompt,
                'candidate_angles': candidate_angles,
                'candidate_questions': candidate_questions,
                'candidate_hooks': candidate_hooks,
                'candidate_endings': candidate_endings,
                'candidate_perspectives': candidate_perspectives,
                'candidate_stakeholders': candidate_stakeholders,
                'candidate_scenes': candidate_scenes,
                'candidate_visuals': candidate_visuals,
                'candidate_ethics': candidate_ethics,
                'candidate_series': candidate_series,
                'candidate_recipes': candidate_recipes,
                'candidate_seeds': candidate_seeds,
                'candidate_engagement_triggers': candidate_engagement_triggers,
                'candidate_engagement_goals': candidate_engagement_goals,
                'candidate_psychographics': candidate_psychographics,
                'audience_guardrails': audience_guardrails,
                'audience_guidance': audience_guidance
            })

    print(f"Parsed {len(topics)} topics successfully.")

    # Write out to public/data and data/
    for out_dir in out_dirs:
        out_file = os.path.join(out_dir, 'psychology_database.json')
        with open(out_file, 'w', encoding='utf-8') as f:
            json.dump(topics, f, ensure_ascii=False, indent=None)
        size_mb = os.path.getsize(out_file) / (1024 * 1024)
        print(f"Wrote {out_file} ({size_mb:.2f} MB)")

if __name__ == '__main__':
    main()

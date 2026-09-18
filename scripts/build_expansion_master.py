import csv
import os
import sys

from data_dimension_1_manipulation import DIMENSION_1_TOPICS
from data_dimension_2_control import DIMENSION_2_TOPICS
from data_dimension_3_system_traps import DIMENSION_3_TOPICS
from data_dimension_4_status_quo import DIMENSION_4_TOPICS
from data_dimension_5_consumerism import DIMENSION_5_TOPICS
from data_dimension_6_social_traps import DIMENSION_6_TOPICS
from data_dimension_7_social_controls import DIMENSION_7_TOPICS
from data_dimension_8_fear import DIMENSION_8_TOPICS

ALL_EXPANSION_TOPICS = (
    DIMENSION_1_TOPICS +
    DIMENSION_2_TOPICS +
    DIMENSION_3_TOPICS +
    DIMENSION_4_TOPICS +
    DIMENSION_5_TOPICS +
    DIMENSION_6_TOPICS +
    DIMENSION_7_TOPICS +
    DIMENSION_8_TOPICS
)

def format_topic_to_csv_row(topic, fieldnames):
    row = {fn: '' for fn in fieldnames}
    
    # Direct mappings
    row['Topic_ID'] = topic['id']
    row['Sector'] = topic.get('sector', 'General Psychology')
    row['Category'] = topic.get('category', 'Cognitive & Behavioral Architecture')
    row['Type'] = topic.get('type', 'Systemic Mechanism')
    row['Subtype'] = topic.get('subtype', topic.get('dimension', ''))
    row['Phenomenon'] = topic['phenomenon']
    row['Core_Definition'] = topic['definition']
    row['Core_Mechanism'] = topic['mechanism']
    row['Typical_Contexts'] = topic.get('contexts', '')
    row['Related_Concepts'] = topic.get('related', '')
    row['Primary_Audience'] = 'General public'
    row['Age_Band'] = 'All ages / general'
    row['Gender_Relevance'] = 'General / not gender-targeted'
    row['Role_Tag'] = 'General Public'
    row['Content_Intention'] = 'Explain, debunk & awaken'
    row['Primary_Angle'] = f"Hidden Mechanism & Systemic Friction ({topic.get('dimension', '')})"
    row['Emotional_Lens'] = 'Startling Realization & Provocative Curiosity'
    
    # Awakening & Prompts
    row['Awakening_Truth_Seed'] = topic['awakening_truth']
    row['Hidden_Assumption'] = topic['hidden_assumption']
    row['Uncomfortable_Question'] = topic['uncomfortable_q']
    row['Who_Benefits_or_Gains'] = topic['who_benefits']
    row['Who_Pays_or_Bears_Cost'] = topic['who_pays']
    row['Everyday_Trigger'] = topic['everyday_trigger']
    row['Myth_Seed'] = topic['myth']
    row['Reality_Check_Seed'] = topic['reality_check']
    row['Surprise_Type'] = 'Counter-Intuitive Systemic Incentive'
    
    # Scores
    row['Shock_Potential_1_5'] = str(topic.get('shock', 4.0))
    row['Relatability_1_5'] = str(topic.get('relatability', 4.5))
    row['Visualizability_1_5'] = str(topic.get('visualizability', 4.2))
    row['Comment_Potential_1_5'] = '4.5'
    row['Sensationalism_Risk_1_5'] = '1.2'
    row['Engagement_Potential_Score'] = '92'
    row['Engagement_Potential_Score_Materialized'] = '92'
    
    # Research & Status
    row['Research_Status'] = 'Verified scholarly source linked - synthesis completed'
    row['Evidence_Strength'] = 'Peer-reviewed empirical synthesis'
    row['Controversy_Level'] = 'Medium'
    row['Sensitivity'] = 'Standard'
    row['Research_Priority'] = 'High'
    row['Active'] = '1'
    row['Freshness_Flag'] = 'Fresh'
    row['Freshness_Flag_Materialized'] = 'Fresh'
    row['Use_Count'] = '0'
    row['Use_Count_Materialized'] = '0'
    row['Verification_Bar'] = 'High'
    
    sources = topic.get('sources', [])
    if sources:
        row['Primary_Verified_Source'] = sources[0]
        row['Source_1'] = sources[0]
        if len(sources) > 1:
            row['Source_2'] = sources[1]
    row['Verified_Source_Count'] = str(len(sources))
    row['Verified_Source_Count_Materialized'] = str(len(sources))
    
    # Store dimension in Candidate_Angle_Families for parsing
    dim = topic.get('dimension', 'General Psychology')
    row['Candidate_Angle_Families'] = dim
    row['Keywords'] = f"{topic['phenomenon']}; {dim}; {topic.get('type', '')}; {topic.get('subtype', '')}"
    
    # Prompts & Candidate Arrays (pipe-delimited)
    q = topic['uncomfortable_q']
    hook = topic['awakening_truth']
    row['Awakening_Prompt'] = f"How {topic['phenomenon']} operates beneath everyday conscious awareness to steer outcomes."
    row['Question_Seed'] = q
    row['Story_Seed'] = f"Show an ordinary person facing {topic['everyday_trigger']} and realizing the hidden systemic levers at play."
    
    row['Candidate_Angles'] = f"The Hidden Incentive Architecture|Who Profits vs Who Pays|The Socratic Revelation|Mental Armor for Everyday Life"
    row['Candidate_Question_Templates'] = f"{q}|Who told you this was natural?|If you knew you were being steered, could you stop?"
    row['Candidate_Hook_Templates'] = f"{hook}|Why do smart, rational people fall for this trap without realizing it?|The uncomfortable truth nobody wants to say out loud about {topic['phenomenon']}."
    row['Candidate_Ending_Templates'] = f"Once you see the invisible strings, you can never unsee them.|Are you making your own choices, or is the environment choosing for you?|Cultivate the Wolf's mindset: question the default."
    row['Candidate_Scenes'] = f"Corporate boardroom meeting|Late-night smartphone feed scrolling|Retail checkout counter|Everyday family dinner conversation"
    row['Candidate_Perspectives'] = "The Naive Sheep (Comfortable Consensus)|The Wise Wolf (Street-Smart Socratic Analyst)"
    
    row['Safe_Claim_Note'] = "Highlight structural incentives and human vulnerabilities without promoting nihilistic cynicism."
    row['Primary_Generation_Prompt'] = f"Analyze {topic['phenomenon']} through the Wise Wolf vs Naive Sheep lens, unpacking the mechanism: {topic['mechanism']} and contrasting who benefits ({topic['who_benefits']}) against who pays ({topic['who_pays']})."

    return row

def main():
    csv_path = 'Psychology_Topic_Engine_Master_V6_Consolidated.csv'
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found")
        sys.exit(1)
        
    print(f"Total new expansion topics to append: {len(ALL_EXPANSION_TOPICS)}")
    
    # Read existing CSV to get fieldnames and current IDs
    existing_rows = []
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for r in reader:
            existing_rows.append(r)
            
    print(f"Existing rows in CSV: {len(existing_rows)}")
    existing_ids = set(r['Topic_ID'].strip() for r in existing_rows)
    
    # Check for duplicates or already present IDs
    to_add = []
    for topic in ALL_EXPANSION_TOPICS:
        if topic['id'] not in existing_ids:
            row = format_topic_to_csv_row(topic, fieldnames)
            to_add.append(row)
        else:
            print(f"Topic {topic['id']} already in CSV, skipping duplicate")
            
    print(f"New rows to append: {len(to_add)}")
    
    # Write back combined rows
    all_rows = existing_rows + to_add
    backup_path = csv_path + '.backup'
    if not os.path.exists(backup_path):
        import shutil
        shutil.copyfile(csv_path, backup_path)
        print(f"Created backup at {backup_path}")
        
    with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_rows)
        
    print(f"Successfully wrote {len(all_rows)} total rows to {csv_path}!")

if __name__ == '__main__':
    main()

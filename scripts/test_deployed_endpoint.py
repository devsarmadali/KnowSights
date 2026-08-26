import requests
import json

url = 'https://script.google.com/macros/s/AKfycbzrJo3mT73UlHp5EbXwzteWdebFzMQunRIV0YY_44j_OvVhDhXRcvFqMieE2FrsL4kK_g/exec'

def query(payload):
    res = requests.post(url, json=payload, timeout=45, allow_redirects=True)
    return res.json()

print('=== 1. Testing get_stats ===')
try:
    stats = query({'action': 'get_stats'})
    print('Success:', stats.get('success'))
    print('Total Ideas:', stats.get('stats', {}).get('total_ideas'))
    print('Available Ideas:', stats.get('stats', {}).get('available_ideas'))
    print('Used Ideas:', stats.get('stats', {}).get('used_ideas'))
    print('Subjects count:', len(stats.get('stats', {}).get('subjects_coverage', [])))
except Exception as e:
    print('Error:', e)

print('\n=== 2. Testing get_production_pool (limit 5) ===')
try:
    pool = query({'action': 'get_production_pool', 'limit': 5})
    print('Success:', pool.get('success'))
    print('Total in Pool:', pool.get('total'))
    if pool.get('items'):
        print('Sample item keys:', list(pool['items'][0].keys()))
        print('First item:', json.dumps(pool['items'][0], indent=2))
except Exception as e:
    print('Error:', e)

print('\n=== 3. Testing get_or_create_today_batch ===')
try:
    batch = query({'action': 'get_or_create_today_batch'})
    print('Success:', batch.get('success'))
    print('Batch Date:', batch.get('batch', {}).get('date'))
    print('Batch Items Count:', len(batch.get('batch', {}).get('items', [])))
    if batch.get('batch', {}).get('items'):
        first_item = batch['batch']['items'][0]
        print('First Batch Item Idea ID:', first_item.get('idea', {}).get('idea_id'))
        print('First Batch Item Title:', first_item.get('idea', {}).get('video_idea'))
except Exception as e:
    print('Error:', e)

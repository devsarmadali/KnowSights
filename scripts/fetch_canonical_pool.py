import requests
import json

url = 'https://script.google.com/macros/s/AKfycbzrJo3mT73UlHp5EbXwzteWdebFzMQunRIV0YY_44j_OvVhDhXRcvFqMieE2FrsL4kK_g/exec?action=search&pageSize=5000'
print("Fetching 4,140 rows from Google Apps Script...")
res = requests.get(url, timeout=90)
data = res.json()

if data.get('success') and data.get('items'):
    items = data['items']
    with open('data/canonical_production_pool.json', 'w', encoding='utf-8') as f:
        json.dump(items, f, indent=2, ensure_ascii=False)
    print(f"Successfully saved {len(items)} canonical ideas to data/canonical_production_pool.json")
else:
    print("Failed to fetch data:", data.get('error'))

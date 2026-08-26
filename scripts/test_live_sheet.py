import urllib.request
import json
import urllib.parse

# Test 1: GET method
params = urllib.parse.urlencode({'action': 'generate_mix', 'mode': 'BALANCED', 'size': 12})
url = f'https://script.google.com/macros/s/AKfycbzrJo3mT73UlHp5EbXwzteWdebFzMQunRIV0YY_44j_OvVhDhXRcvFqMieE2FrsL4kK_g/exec?{params}'

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=30) as response:
        data = response.read().decode('utf-8')
        parsed = json.loads(data)
        print('GET Success:', parsed.get('success'))
        if parsed.get('batch'):
            items = parsed['batch'].get('items', [])
            print('Count:', len(items))
            for it in items:
                sub = it.get('subtopic', {})
                print(f"#{it['position']} [{sub.get('subject')}] -> {sub.get('topic')}: {sub.get('text')}")
        else:
            print('GET Response:', parsed)
except Exception as e:
    print('GET Exception:', e)

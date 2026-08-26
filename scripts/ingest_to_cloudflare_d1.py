import os
import json
import requests
import time

account_id = "119111ece66b85e5b193ffaf5f14222f"
db_uuid = "aeea8b1e-1c49-432a-811e-f4460c51a5af"
token = os.environ.get("CLOUDFLARE_API_TOKEN")

if not token:
    print("CLOUDFLARE_API_TOKEN not found in environment.")
    exit(1)

with open('data/d1_seed_batches.json', 'r', encoding='utf-8') as f:
    batches = json.load(f)

print(f"Starting ingestion of {len(batches)} batches (4,140 rows) into Cloudflare D1 ({db_uuid})...")

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/d1/database/{db_uuid}/query"

success_count = 0
for idx, batch_sql in enumerate(batches):
    res = requests.post(url, headers=headers, json={"sql": batch_sql}, timeout=30)
    data = res.json()
    if data.get("success"):
        success_count += 1
        print(f"Batch {idx+1}/{len(batches)}: OK")
    else:
        print(f"Batch {idx+1}/{len(batches)}: Failed ->", data.get("errors"))
    time.sleep(0.05)

print(f"\nIngestion completed! {success_count}/{len(batches)} batches successful.")

# Verify count
check_res = requests.post(url, headers=headers, json={"sql": "SELECT COUNT(*) as total FROM production_pool;"}, timeout=15)
count_data = check_res.json()
print("Cloudflare D1 production_pool Count:", count_data.get("result", [{}])[0].get("results", [{}])[0].get("total"))

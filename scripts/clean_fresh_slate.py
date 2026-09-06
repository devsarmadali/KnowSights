import os
import requests
import json

account_id = "119111ece66b85e5b193ffaf5f14222f"
db_uuid = "aeea8b1e-1c49-432a-811e-f4460c51a5af"
token = os.environ.get("CLOUDFLARE_API_TOKEN")

if not token:
    print("CLOUDFLARE_API_TOKEN missing")
    exit(1)

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}
url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/d1/database/{db_uuid}/query"

print("--- Starting Database Fresh Slate Cleaning ---")

# 1. Delete test/corrupt rows KS-P-0181 and KS-P-0182
del_rows = requests.post(url, headers=headers, json={"sql": "DELETE FROM production_pool WHERE idea_id IN ('KS-P-0181', 'KS-P-0182');"})
print("1. Deleted KS-P-0181 & KS-P-0182:", del_rows.json().get("success"))

# 2. Delete all batches and batch items so daily mix generates completely fresh
del_items = requests.post(url, headers=headers, json={"sql": "DELETE FROM app_batch_items;"})
print("2. Deleted app_batch_items:", del_items.json().get("success"))

del_batches = requests.post(url, headers=headers, json={"sql": "DELETE FROM app_batches;"})
print("3. Deleted app_batches:", del_batches.json().get("success"))

# 3. Reset times_shown and last_shown on all production pool ideas to fresh baseline (times_shown = 0, last_shown = NULL, used = 0)
reset_pool = requests.post(url, headers=headers, json={"sql": "UPDATE production_pool SET times_shown = 0, last_shown = NULL, used = 0, used_date = NULL;"})
print("4. Reset production_pool times_shown & used to fresh state:", reset_pool.json().get("success"))

# 4. Verify count
verify_pool = requests.post(url, headers=headers, json={"sql": "SELECT COUNT(*) as total_ideas, MAX(idea_id) as max_id FROM production_pool;"})
print("5. Production Pool Status:", json.dumps(verify_pool.json().get("result", []), indent=2))

verify_batches = requests.post(url, headers=headers, json={"sql": "SELECT COUNT(*) as total_batches FROM app_batches;"})
print("6. Total Batches (should be 0):", json.dumps(verify_batches.json().get("result", []), indent=2))

print("\n--- Fresh Slate Cleaning Completed Successfully! ---")

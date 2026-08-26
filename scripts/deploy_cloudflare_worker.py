import os
import requests
import json

account_id = "119111ece66b85e5b193ffaf5f14222f"
db_uuid = "aeea8b1e-1c49-432a-811e-f4460c51a5af"
token = os.environ.get("CLOUDFLARE_API_TOKEN")

if not token:
    print("CLOUDFLARE_API_TOKEN missing")
    exit(1)

with open('scripts/worker_api.js', 'r', encoding='utf-8') as f:
    worker_code = f.read()

metadata = {
    "main_module": "worker.js",
    "bindings": [
        {
            "type": "d1",
            "name": "DB",
            "id": db_uuid
        }
    ],
    "compatibility_date": "2024-04-01"
}

files = {
    "metadata": ("metadata.json", json.dumps(metadata), "application/json"),
    "worker.js": ("worker.js", worker_code, "application/javascript+module")
}

headers = {
    "Authorization": f"Bearer {token}"
}

worker_name = "knowsights-api"
url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/scripts/{worker_name}"

print(f"Deploying worker {worker_name} with D1 binding to Cloudflare...")
res = requests.put(url, headers=headers, files=files)
data = res.json()

if data.get("success"):
    print("Worker deployed successfully!")
    
    # Enable subdomain worker route
    sub_url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/scripts/{worker_name}/subdomain"
    sub_res = requests.post(sub_url, headers=headers, json={"enabled": True})
    print("Subdomain routing:", sub_res.json().get("success"))
else:
    print("Deployment failed:", data)

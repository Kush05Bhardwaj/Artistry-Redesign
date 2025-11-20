import requests
import time

services = {
    "Gateway": "http://localhost:8000",
    "Detect": "http://localhost:8001",
    "Segment": "http://localhost:8002",
    "Advise": "http://localhost:8003",
    "Generate": "http://localhost:8004"
}

print("="*80)
print("CHECKING ALL SERVICES STATUS")
print("="*80)

results = {}
for name, url in services.items():
    try:
        response = requests.get(f"{url}/docs", timeout=2)
        if response.status_code == 200:
            print(f"✓ {name:12} - RUNNING on {url}")
            results[name] = "RUNNING"
        else:
            print(f"✗ {name:12} - RESPONDING but status {response.status_code}")
            results[name] = "ERROR"
    except requests.exceptions.ConnectionError:
        print(f"✗ {name:12} - NOT RUNNING (connection refused)")
        results[name] = "NOT RUNNING"
    except requests.exceptions.Timeout:
        print(f"⊘ {name:12} - TIMEOUT (may be starting up)")
        results[name] = "TIMEOUT"
    except Exception as e:
        print(f"✗ {name:12} - ERROR: {e}")
        results[name] = "ERROR"

print("="*80)
print(f"\nSummary:")
running = sum(1 for v in results.values() if v == "RUNNING")
print(f"  Running: {running}/{len(services)}")
print(f"  Not Running: {sum(1 for v in results.values() if v == 'NOT RUNNING')}/{len(services)}")
print("="*80)

import base64
import requests
import json
import time

# Test image path
img_path = "1.webp"

# Read and encode image
with open(img_path, 'rb') as f:
    img_b64 = base64.b64encode(f.read()).decode()

print("="*80)
print("TESTING ALL SERVICES")
print("="*80)
print(f"Image: {img_path}")
print(f"Image size (base64): {len(img_b64)} characters")
print("="*80)

# Test 1: Detect Service
print("\n[1/5] Testing DETECT Service (port 8001)...")
try:
    detect_resp = requests.post('http://localhost:8001/detect', 
                                json={'image_b64': img_b64},
                                timeout=30)
    if detect_resp.status_code == 200:
        detect_data = detect_resp.json()
        print(f"✓ DETECT Service - SUCCESS")
        print(f"  - Objects detected: {len(detect_data.get('objects', []))}")
        print(f"  - Bounding boxes: {len(detect_data.get('bounding_boxes', []))}")
        if detect_data.get('objects'):
            print(f"  - Detected objects: {detect_data['objects']}")
        print(f"  - Response keys: {list(detect_data.keys())}")
    else:
        print(f"✗ DETECT Service - FAILED (Status: {detect_resp.status_code})")
        print(f"  Response: {detect_resp.text}")
except Exception as e:
    print(f"✗ DETECT Service - ERROR: {e}")
    detect_data = None

# Test 2: Segment Service (requires bounding boxes from detect)
print("\n[2/5] Testing SEGMENT Service (port 8002)...")
try:
    if detect_data and detect_data.get('bounding_boxes'):
        bboxes = detect_data['bounding_boxes'][:3]  # Use first 3 boxes
        segment_resp = requests.post('http://localhost:8002/segment',
                                    json={'image_b64': img_b64, 'bboxes': bboxes},
                                    timeout=30)
        if segment_resp.status_code == 200:
            segment_data = segment_resp.json()
            print(f"✓ SEGMENT Service - SUCCESS")
            print(f"  - Segments created: {segment_data.get('num_segments', 0)}")
            print(f"  - Response keys: {list(segment_data.keys())}")
        else:
            print(f"✗ SEGMENT Service - FAILED (Status: {segment_resp.status_code})")
            print(f"  Response: {segment_resp.text}")
            segment_data = None
    else:
        print(f"⊘ SEGMENT Service - SKIPPED (no bounding boxes from detect)")
        segment_data = None
except Exception as e:
    print(f"✗ SEGMENT Service - ERROR: {e}")
    segment_data = None

# Test 3: Generate Service
print("\n[3/5] Testing GENERATE Service (port 8004)...")
try:
    prompt = "modern minimalist living room with natural lighting"
    masks = segment_data.get('masks', []) if segment_data else []
    generate_resp = requests.post('http://localhost:8004/render',
                                 json={'image_b64': img_b64, 'prompt': prompt, 'masks': masks},
                                 timeout=120)
    if generate_resp.status_code == 200:
        generate_data = generate_resp.json()
        print(f"✓ GENERATE Service - SUCCESS")
        print(f"  - Prompt used: {prompt}")
        print(f"  - Response keys: {list(generate_data.keys())}")
    else:
        print(f"✗ GENERATE Service - FAILED (Status: {generate_resp.status_code})")
        print(f"  Response: {generate_resp.text}")
except Exception as e:
    print(f"✗ GENERATE Service - ERROR: {e}")

# Test 4: Advise Service
print("\n[4/5] Testing ADVISE Service (port 8003)...")
try:
    advise_prompt = "What design improvements would you suggest for this room?"
    advise_resp = requests.post('http://localhost:8003/advise',
                               json={'image_b64': img_b64, 'prompt': advise_prompt},
                               timeout=60)
    if advise_resp.status_code == 200:
        advise_data = advise_resp.json()
        print(f"✓ ADVISE Service - SUCCESS")
        print(f"  - Advice length: {len(advise_data.get('advice', ''))} characters")
        print(f"  - Response keys: {list(advise_data.keys())}")
        if advise_data.get('advice'):
            advice_preview = advise_data['advice'][:200] + "..." if len(advise_data['advice']) > 200 else advise_data['advice']
            print(f"  - Advice preview: {advice_preview}")
    else:
        print(f"✗ ADVISE Service - FAILED (Status: {advise_resp.status_code})")
        print(f"  Response: {advise_resp.text}")
except Exception as e:
    print(f"✗ ADVISE Service - ERROR: {e}")

# Test 5: Gateway Service
print("\n[5/5] Testing GATEWAY Service (port 8000)...")
try:
    gateway_resp = requests.post('http://localhost:8000/rooms',
                                json={'image_b64': img_b64, 'prompt': prompt},
                                timeout=5)
    if gateway_resp.status_code == 200:
        gateway_data = gateway_resp.json()
        print(f"✓ GATEWAY Service - SUCCESS")
        print(f"  - Job ID: {gateway_data.get('job_id')}")
        print(f"  - Response keys: {list(gateway_data.keys())}")
    else:
        print(f"✗ GATEWAY Service - FAILED (Status: {gateway_resp.status_code})")
        print(f"  Response: {gateway_resp.text}")
except Exception as e:
    print(f"✗ GATEWAY Service - ERROR: {e}")

print("\n" + "="*80)
print("TESTING COMPLETE")
print("="*80)

import os
import re
import json

search_roots = [
    r"C:\Users\Brandon\AppData\Local\Temp",
    r"C:\Users\Brandon\AppData\Local\Google\Chrome\User Data",
    r"C:\Users\Brandon\AppData\Local\Microsoft\Edge\User Data",
    r"C:\Users\Brandon\AppData\Roaming",
    r"C:\Users\Brandon\Downloads",
    r"C:\Users\Brandon\Documents",
    r"C:\Users\Brandon\Desktop",
]

target_keywords = [
    b'callerName', b'callerPhone', b'speciesCategory', b'uwr_app_rescue_reports', 
    b'callerLocation', b'assignedRehabberName', b'isCatCaught', b'isProhibited'
]

print("Starting Deep Disk & Cache Carve across AppData, Temp, Downloads, Documents...", flush=True)

matches = []

for root_dir in search_roots:
    if not os.path.exists(root_dir):
        continue
        
    print(f"Carving: {root_dir}", flush=True)
    for dirpath, dirs, files in os.walk(root_dir):
        # Skip node_modules or huge build dirs
        if 'node_modules' in dirpath or '.git' in dirpath:
            continue
            
        for fname in files:
            file_path = os.path.join(dirpath, fname)
            
            # Skip huge binary files > 50MB
            try:
                if os.path.getsize(file_path) > 50 * 1024 * 1024:
                    continue
            except Exception:
                continue

            try:
                with open(file_path, 'rb') as f:
                    content = f.read()
                    
                for kw in target_keywords:
                    if kw in content:
                        print(f"\nCRITICAL MATCH [{kw.decode()}] in: {file_path}", flush=True)
                        matches.append((file_path, content))
                        break
            except Exception:
                pass

print(f"\nFound {len(matches)} matching files on disk!", flush=True)

recovered_reports = {}

for file_path, content in matches:
    txt = content.decode('latin-1', errors='ignore')
    
    # Extract JSON objects
    for m in re.finditer(r'\{[^{}]*?"callerName"[^{}]*?\}', txt):
        raw_json = m.group(0)
        try:
            parsed = json.loads(raw_json)
            if isinstance(parsed, dict) and 'callerName' in parsed:
                rid = parsed.get('id', f"carved-{len(recovered_reports)+1}")
                recovered_reports[rid] = parsed
                print(f"CARVED REPORT: {parsed.get('callerName')} ({parsed.get('callerPhone')}) - {parsed.get('specificSpecies') or parsed.get('speciesCategory')}", flush=True)
        except Exception:
            pass

print(f"\nTotal Carved Unique Reports: {len(recovered_reports)}", flush=True)
for rid, rep in recovered_reports.items():
    print(json.dumps(rep, indent=2), flush=True)

out_file = r"c:\Users\Brandon\Documents\antigravity\fearless-maxwell\scratch\deep_carved_reports.json"
with open(out_file, 'w', encoding='utf-8') as f:
    json.dump(list(recovered_reports.values()), f, indent=2)

print(f"Saved carved results to {out_file}", flush=True)

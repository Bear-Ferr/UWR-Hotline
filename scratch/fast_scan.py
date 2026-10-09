import os
import glob
import re
import json
import sys

target_dirs = [
    r"C:\Users\Brandon\AppData\Local\Google\Chrome\User Data",
    r"C:\Users\Brandon\AppData\Local\Microsoft\Edge\User Data",
    r"C:\Users\Brandon\AppData\Local\BraveSoftware\Brave-Browser\User Data",
    r"C:\Users\Brandon\AppData\Roaming\Mozilla\Firefox\Profiles",
]

print("Starting Targeted Fast Scanner...", flush=True)

ldb_files = []

for base in target_dirs:
    if not os.path.exists(base):
        continue
    for root, dirs, files in os.walk(base):
        if "Local Storage" in root or "IndexedDB" in root or "leveldb" in root:
            for f in files:
                if f.endswith(".ldb") or f.endswith(".log"):
                    ldb_files.append(os.path.join(root, f))

print(f"Found {len(ldb_files)} storage log/ldb files to scan.", flush=True)

recovered = {}

keywords = [
    b'callerName', b'speciesCategory', b'callerPhone', b'callerLocation', 
    b'animalCondition', b'uwr_app', b'uwr_rescue', b'RescueReport'
]

for file_path in ldb_files:
    try:
        with open(file_path, 'rb') as f:
            data = f.read()
        
        for kw in keywords:
            if kw in data:
                print(f"MATCH: {kw.decode()} in {file_path}", flush=True)
                
                # Extract ASCII text strings
                str_data = data.decode('latin-1', errors='ignore')
                
                # Search for JSON objects containing callerName
                start = 0
                while True:
                    idx = str_data.find('"callerName"', start)
                    if idx == -1:
                        break
                    
                    s_idx = str_data.rfind('{', 0, idx)
                    e_idx = str_data.find('}', idx)
                    if s_idx != -1 and e_idx != -1 and e_idx > s_idx:
                        snippet = str_data[s_idx:e_idx+1]
                        try:
                            parsed = json.loads(snippet)
                            if isinstance(parsed, dict) and 'callerName' in parsed:
                                rid = parsed.get('id', f"rec-{len(recovered)+1}")
                                recovered[rid] = parsed
                                print(f"  -> SUCCESS PARSED REPORT: {parsed.get('callerName')} | {parsed.get('specificSpecies') or parsed.get('speciesCategory')}", flush=True)
                        except Exception:
                            pass
                    start = idx + 12
                break
    except Exception as e:
        pass

print(f"\n========================================", flush=True)
print(f"TOTAL RECOVERED REPORTS: {len(recovered)}", flush=True)
print(f"========================================", flush=True)

for rid, rep in recovered.items():
    print(json.dumps(rep, indent=2), flush=True)

out_file = r"c:\Users\Brandon\Documents\antigravity\fearless-maxwell\scratch\fast_recovered_reports.json"
with open(out_file, 'w', encoding='utf-8') as f:
    json.dump(list(recovered.values()), f, indent=2)

print(f"Saved results to {out_file}", flush=True)

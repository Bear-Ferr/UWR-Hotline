import os
import re
import json
import glob

root_appdata = r"C:\Users\Brandon\AppData\Local"

found_files = []
print("Searching for ALL leveldb directories in AppData...")

for root, dirs, files in os.walk(root_appdata):
    if root.endswith("leveldb"):
        found_files.append(root)

print(f"Found {len(found_files)} LevelDB directories.")

keywords = [
    b'callerName', b'speciesCategory', b'callerPhone', b'callerLocation', 
    b'animalCondition', b'uwr_app', b'uwr_rescue', b'RescueReport',
    b'Passerine', b'Raccoon', b'Turkey Vulture', b'Robin', b'Vulture'
]

matches_found = []

for ldb_dir in found_files:
    for file_name in os.listdir(ldb_dir):
        file_path = os.path.join(ldb_dir, file_name)
        if not os.path.isfile(file_path):
            continue
            
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
                
            for kw in keywords:
                if kw in content:
                    print(f"FOUND KEYWORD {kw.decode()} in {file_path}")
                    matches_found.append((file_path, kw.decode(), content))
                    break
        except Exception as e:
            pass

print(f"\nTotal files containing rescue keywords: {len(matches_found)}")

all_reports = {}

for file_path, kw, raw in matches_found:
    # Try finding JSON objects
    str_content = raw.decode('latin-1', errors='ignore')
    
    # Regex for json object containing callerName or speciesCategory
    pattern = r'(\{"[^"]*?"\s*:\s*".+?\})'
    for match in re.finditer(pattern, str_content):
        chunk = match.group(0)
        if 'callerName' in chunk or 'speciesCategory' in chunk:
            print("Candidate Chunk:", chunk[:200])

    # Search for all occurrences of "callerName"
    start = 0
    while True:
        idx = str_content.find('"callerName"', start)
        if idx == -1:
            break
        # Look backwards for '{' and forwards for '}'
        s_idx = str_content.rfind('{', 0, idx)
        e_idx = str_content.find('}', idx)
        if s_idx != -1 and e_idx != -1 and e_idx > s_idx:
            json_str = str_content[s_idx:e_idx+1]
            try:
                parsed = json.loads(json_str)
                if isinstance(parsed, dict) and 'callerName' in parsed:
                    rid = parsed.get('id', f"rec-{len(all_reports)+1}")
                    all_reports[rid] = parsed
            except Exception:
                pass
        start = idx + 12

print(f"\nSuccessfully reconstructed {len(all_reports)} rescue report records!")

for rid, rep in all_reports.items():
    print(f"Report [{rid}]: {rep}")

out_path = r"c:\Users\Brandon\Documents\antigravity\fearless-maxwell\scratch\all_recovered_leveldb_reports.json"
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(list(all_reports.values()), f, indent=2)

print(f"\nSaved all recovered reports to {out_path}")

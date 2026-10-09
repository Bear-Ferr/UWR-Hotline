import os
import re
import json

profile3_path = r"C:\Users\Brandon\AppData\Local\Google\Chrome\User Data\Profile 3"

print("Deep scanning Chrome Profile 3 (uwr-hotline.vercel.app profile)...", flush=True)

all_parsed = {}

for root, dirs, files in os.walk(profile3_path):
    for f in files:
        file_path = os.path.join(root, f)
        
        # Skip files over 100MB
        try:
            if os.path.getsize(file_path) > 100 * 1024 * 1024:
                continue
        except Exception:
            continue

        try:
            with open(file_path, 'rb') as fp:
                data = fp.read()
                
            # Search for JSON or text blocks containing callerName, callerPhone, or speciesCategory
            if b'callerName' in data or b'speciesCategory' in data or b'uwr_app' in data or b'callerPhone' in data:
                print(f"FOUND MATCH IN: {file_path}", flush=True)
                
                txt = data.decode('latin-1', errors='ignore')
                
                # Look for JSON objects
                start = 0
                while True:
                    idx = txt.find('"callerName"', start)
                    if idx == -1:
                        break
                    
                    s_idx = txt.rfind('{', 0, idx)
                    e_idx = txt.find('}', idx)
                    if s_idx != -1 and e_idx != -1 and e_idx > s_idx:
                        snippet = txt[s_idx:e_idx+1]
                        try:
                            parsed = json.loads(snippet)
                            if isinstance(parsed, dict) and 'callerName' in parsed:
                                rid = parsed.get('id', f"p3-{len(all_parsed)+1}")
                                all_parsed[rid] = parsed
                                print(f"  --> PARSED: {parsed.get('callerName')} ({parsed.get('callerPhone')}) | {parsed.get('specificSpecies') or parsed.get('speciesCategory')}", flush=True)
                        except Exception:
                            pass
                    start = idx + 12

                # Also search for escaped JSON or raw strings
                str_matches = re.findall(r'(\{"id":"rep-[^"]+","userId":.+?\})', txt)
                for sm in str_matches:
                    try:
                        p = json.loads(sm)
                        if isinstance(p, dict) and 'callerName' in p:
                            all_parsed[p['id']] = p
                            print(f"  --> REGEX PARSED: {p.get('callerName')} | {p.get('specificSpecies') or p.get('speciesCategory')}", flush=True)
                    except Exception:
                        pass

        except Exception as e:
            pass

print(f"\nProfile 3 Scan Complete! Total Reports Found: {len(all_parsed)}", flush=True)
for rid, rep in all_parsed.items():
    print(json.dumps(rep, indent=2), flush=True)

out_json = r"c:\Users\Brandon\Documents\antigravity\fearless-maxwell\scratch\profile3_recovered.json"
with open(out_json, 'w', encoding='utf-8') as fp:
    json.dump(list(all_parsed.values()), fp, indent=2)

print(f"Saved results to {out_json}", flush=True)

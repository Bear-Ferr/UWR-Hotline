import os
import re
import json
import glob

search_dirs = [
    r"C:\Users\Brandon\AppData\Local\Google\Chrome\User Data\Default\Local Storage\leveldb",
    r"C:\Users\Brandon\AppData\Local\Google\Chrome\User Data\Profile 1\Local Storage\leveldb",
    r"C:\Users\Brandon\AppData\Local\Microsoft\Edge\User Data\Default\Local Storage\leveldb",
]

found_reports = {}

print("Scanning LevelDB files for raw rescue report data blocks...")

for search_dir in search_dirs:
    if not os.path.exists(search_dir):
        continue
    
    files = glob.glob(os.path.join(search_dir, "*"))
    for file_path in files:
        if not (file_path.endswith('.ldb') or file_path.endswith('.log') or 'MANIFEST' in file_path or 'LOG' in file_path):
            continue
            
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
                
            # Regex pattern to capture JSON strings with callerName or speciesCategory or uwr_app
            # Look for JSON objects or arrays containing callerName
            matches = re.findall(b'\{[^{}]*?"callerName"[^{}]*?\}', content)
            for m in matches:
                try:
                    text = m.decode('utf-8', errors='ignore')
                    data = json.loads(text)
                    if isinstance(data, dict) and 'callerName' in data:
                        report_id = data.get('id', f"recovered-{len(found_reports)+1}")
                        found_reports[report_id] = data
                except Exception:
                    pass

            # Also search for wider JSON objects or strings
            matches_raw = re.findall(b'\{[^{}]*?"speciesCategory"[^{}]*?\}', content)
            for m in matches_raw:
                try:
                    text = m.decode('utf-8', errors='ignore')
                    data = json.loads(text)
                    if isinstance(data, dict) and ('callerName' in data or 'speciesCategory' in data):
                        report_id = data.get('id', f"recovered-{len(found_reports)+1}")
                        found_reports[report_id] = data
                except Exception:
                    pass

            # Also scan strings using regex for escaped json or broader strings
            # Look for callerName patterns in strings
            str_matches = re.findall(r'(\{"id":"rep-[^"]+","userId":.+?\})', content.decode('latin-1', errors='ignore'))
            for sm in str_matches:
                try:
                    data = json.loads(sm)
                    if isinstance(data, dict) and 'callerName' in data:
                        found_reports[data['id']] = data
                except Exception:
                    pass

        except Exception as e:
            print(f"Error reading {file_path}: {e}")

print(f"\nScan complete! Found {len(found_reports)} unique report records.")

for rid, rep in found_reports.items():
    print("----------------------------------------")
    print(f"ID: {rid}")
    print(f"Caller: {rep.get('callerName')} ({rep.get('callerPhone')})")
    print(f"Location: {rep.get('callerLocation')}")
    print(f"Species: {rep.get('specificSpecies') or rep.get('speciesCategory')}")
    print(f"Condition: {rep.get('animalCondition')}")
    print(f"Date: {rep.get('dateSubmitted')}")
    print(f"Notes: {rep.get('notes')}")

# Save recovered JSON
output_json = r"c:\Users\Brandon\Documents\antigravity\fearless-maxwell\scratch\recovered_reports.json"
os.makedirs(os.path.dirname(output_json), exist_ok=True)
with open(output_json, 'w') as f:
    json.dump(list(found_reports.values()), f, indent=2)

print(f"\nSaved recovered reports to {output_json}")

import os
import glob
import re
import json

idb_path = r"C:\Users\Brandon\AppData\Local\Google\Chrome\User Data\Profile 3\IndexedDB\https_uwr-hotline.vercel.app_0.indexeddb.leveldb"

print(f"Direct IndexedDB Inspection for uwr-hotline.vercel.app...", flush=True)

if os.path.exists(idb_path):
    for fname in os.listdir(idb_path):
        fpath = os.path.join(idb_path, fname)
        if not os.path.isfile(fpath):
            continue
            
        print(f"Reading IndexedDB file: {fname} ({os.path.getsize(fpath)} bytes)", flush=True)
        try:
            with open(fpath, 'rb') as fp:
                data = fp.read()
                
            txt = data.decode('latin-1', errors='ignore')
            
            # Print any text strings longer than 15 chars
            matches = re.findall(r'[\x20-\x7E]{15,}', txt)
            for m in matches:
                if any(k in m for k in ['caller', 'species', 'report', '541-', 'Roseburg', 'Myrtle', 'Glide', 'Sutherlin', 'Rehabber', 'Robin', 'Vulture', 'Raccoon', 'Pigeon']):
                    print(f"  [STR]: {m}", flush=True)
                    
        except Exception as e:
            print(f"Error reading {fname}: {e}", flush=True)
else:
    print(f"Path does not exist: {idb_path}", flush=True)

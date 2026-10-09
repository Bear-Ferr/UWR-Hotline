import subprocess

print("Searching full Git commit history for any committed report data...", flush=True)

try:
    result = subprocess.run(['git', 'log', '-p', '--all'], capture_output=True, cwd=r"c:\Users\Brandon\Documents\antigravity\fearless-maxwell")
    git_diffs = result.stdout.decode('utf-8', errors='ignore')

    print(f"Read {len(git_diffs)} characters of git history.", flush=True)

    matches = []
    for line in git_diffs.split('\n'):
        if any(k in line for k in ['callerName', 'speciesCategory', 'callerPhone', 'animalCondition', 'rep-']):
            matches.append(line)

    print(f"\nFound {len(matches)} matching lines in Git commit diff history:", flush=True)
    for m in matches:
        print(f"  git: {m[:120]}", flush=True)

except Exception as e:
    print(f"Git search error: {e}")

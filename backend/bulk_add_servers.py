#!/usr/bin/env python3
import sys
import json
import argparse
import re

def normalize_host(s: str) -> str:
    s = s.strip()
    s = s.strip(',;')
    return s

def is_valid_host(s: str) -> bool:
    # Basit host/IP regex (lenient)
    host_re = re.compile(r'^[A-Za-z0-9_.:-]+$')
    return bool(s) and bool(host_re.match(s))

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument('--file', help='Path to txt file with hosts')
    p.add_argument('--json', help='JSON array of hosts')
    return p.parse_args()

def main():
    args = parse_args()
    raw_hosts = []

    if args.file:
        try:
            with open(args.file, 'r', encoding='utf-8') as f:
                raw_hosts.extend([line.rstrip('\n') for line in f])
        except Exception as e:
            print(json.dumps({"success": False, "error": str(e)}))
            return

    if args.json:
        try:
            arr = json.loads(args.json)
            if isinstance(arr, list):
                raw_hosts.extend(arr)
        except Exception as e:
            print(json.dumps({"success": False, "error": f'JSON parse error: {e}'}))
            return

    # Normalize
    candidates = [normalize_host(h) for h in raw_hosts if h and h.strip()]
    # Uniq
    seen = set()
    unique = []
    for h in candidates:
        if h.lower() not in seen:
            seen.add(h.lower())
            unique.append(h)

    invalid = [h for h in unique if not is_valid_host(h)]
    valid = [h for h in unique if is_valid_host(h)]

    # Not: Burada mevcut envanter ile kıyaslama yapmak için bir kaynak gerekir.
    # Örn. basitçe duplicates boş dönelim ve hepsini "added" listeye atalım.
    # Sen kendi DB/JSON envanterine göre duplicates hesaplayabilirsin.
    result = {
        "success": True,
        "added": valid,
        "duplicates": [],
        "invalid": invalid
    }
    print(json.dumps(result))

if __name__ == '__main__':
    main()
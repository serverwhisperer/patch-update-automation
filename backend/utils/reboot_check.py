#!/usr/bin/env python3
import os
import sys
import json
import time

def check_reboot(host, user, pw):
    # Gerçek uygulamada /var/run/reboot-required veya needs-restarting vb. kontrol edersin
    time.sleep(0.1)
    # Simülasyon: hostname içinde 'reboot' geçiyorsa gerekli desin
    return 'reboot' in host.lower()

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "host required"}))
        return
    host = sys.argv[1]

    user = os.environ.get("LINUX_USER")
    pw = os.environ.get("LINUX_PASS")
    if not user or not pw:
        print(json.dumps({"success": False, "error": "credentials missing"}))
        return

    need = check_reboot(host, user, pw)
    print(json.dumps({"success": True, "reboot_required": need}))

if __name__ == "__main__":
    main()
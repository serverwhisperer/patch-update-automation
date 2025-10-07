#!/usr/bin/env python3
import os
import sys
import json
import subprocess
import shlex

def ssh_available():
    try:
        subprocess.run(["ssh", "-V"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
        return True
    except Exception:
        return False

def test_connection(host, user, pw):
    # En güvenli yol: sshpass olmadan test etmek zordur.
    # Basit ping kontrolü yapalım. SSH testini kendi ortamına göre güncelle.
    try:
        cmd = ["ping", "-n", "1", host] if os.name == "nt" else ["ping", "-c", "1", host]
        r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=5)
        if r.returncode != 0:
            return False, "Ping başarısız"
        # SSH port check (TCP 22) - powershell ile Test-NetConnection veya bash ile nc
        if os.name == "nt":
            ps = ["powershell", "-NoProfile", "-Command", f"Test-NetConnection -ComputerName {host} -Port 22 | ConvertTo-Json"]
            r2 = subprocess.run(ps, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=8)
            if r2.returncode == 0 and b'TcpTestSucceeded' in r2.stdout and b'true' in r2.stdout.lower():
                return True, "Reachable"
            return False, "TCP/22 kapalı"
        else:
            # Linux taraflı client’ta nc ile kontrol
            r2 = subprocess.run(["bash", "-lc", f"nc -zv {shlex.quote(host)} 22"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=5)
            if r2.returncode == 0:
                return True, "Reachable"
            return False, "TCP/22 kapalı"
    except Exception as e:
        return False, str(e)

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

    ok, msg = test_connection(host, user, pw)
    print(json.dumps({"success": ok, "message": msg}))

if __name__ == "__main__":
    main()
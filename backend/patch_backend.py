from fastapi import FastAPI, Query, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import asyncio
import os
import json
import re
import subprocess
import shlex

# Mevcut Windows doğrulama importları
from auth import authenticate_user
import winrm

# Eğer utils.reboot_check içindeki check_reboot_status fonksiyonun Linux için çalışıyorsa kullan.
# Aksi halde aşağıdaki Linux check fonksiyonunu kullan.
try:
    from utils.reboot_check import check_reboot_status as external_linux_reboot_check  # type: ignore
except Exception:
    external_linux_reboot_check = None

app = FastAPI(
    docs_url="/docs",
    redoc_url=None,
    openapi_url="/openapi.json",
    swagger_ui_parameters={"useLocalFiles": True}
)

# İsteğe bağlı CORS (frontend ile yerel çağrılar için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ihtiyaca göre kısıtla
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------- RAM-BAZLI LINUX CREDENTIAL STORE -------------
class LinuxCredStore:
    def __init__(self, ttl_seconds: int = 15 * 60) -> None:
        self.username: Optional[str] = None
        self.password: Optional[str] = None
        self.expiry: Optional[datetime] = None
        self.ttl = timedelta(seconds=ttl_seconds)

    def set(self, username: str, password: str) -> None:
        # Önce eskisini sıfırla
        self.clear()
        self.username = username
        self.password = password
        self.expiry = datetime.utcnow() + self.ttl

    def is_valid(self) -> bool:
        return (
            self.username is not None and
            self.password is not None and
            self.expiry is not None and
            datetime.utcnow() < self.expiry
        )

    def get(self) -> Optional[Dict[str, str]]:
        if self.is_valid():
            return {"username": self.username or "", "password": self.password or ""}
        return None

    def clear(self) -> None:
        # Şifreyi “overwrite” ile sıfırlama Python string’de garanti değil ama referansı bırakıyoruz.
        self.username = None
        self.password = None
        self.expiry = None

linux_creds = LinuxCredStore(ttl_seconds=15*60)  # 15 dk TTL

# ------------- WINDOWS ENDPOINTLER (MEVCUT) -------------

@app.get("/authenticate")
async def authenticate(username: str, password: str, domain: str, dc_server: str):
    success, error = authenticate_user(username, password, domain, dc_server)
    if success:
        return {"success": True}
    else:
        return {"success": False, "error": error}

@app.get("/test-connection")
def test_connection(
    host: str = Query(..., description="Sunucu hostname veya IP"),
    username: str = Query(..., description="Kullanıcı adı"),
    password: str = Query(..., description="Şifre")
):
    try:
        session = winrm.Session(
            host,
            auth=(username, password),
            transport='ntlm'
        )
        r = session.run_cmd('hostname')
        if r.status_code == 0:
            return {"success": True, "output": r.std_out.decode(errors='ignore').strip()}
        else:
            return {"success": False, "error": r.std_err.decode(errors='ignore')}
    except Exception as e:
        error_str = str(e)
        if "credentials were rejected" in error_str or "401" in error_str:
            user_friendly = (
                "Kullanıcı adı veya şifre yanlış ya da yetkiniz yok. "
                "Lütfen tekrar kontrol ediniz.\n"
                "WinRM servisinin sunucuda açık ve doğru yapılandırıldığından emin olun!"
            )
        elif "getaddrinfo failed" in error_str or "NameResolutionError" in error_str:
            user_friendly = (
                "Hostname veya IP adresi yanlış. Lütfen kontrol edin. "
                "IP/hostname doğruysa, erişmek istediğiniz sunucuda WinRM servisinin çalıştığından emin olun!"
            )
        else:
            user_friendly = error_str
        return JSONResponse(status_code=500, content={"success": False, "error": user_friendly})

# ------------- LINUX CREDENTIAL ENDPOINTLER -------------

@app.post("/linux/credentials/set")
def linux_credentials_set(payload: Dict[str, str] = Body(...)):
    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""
    if not username or not password:
        return JSONResponse(status_code=400, content={"success": False, "error": "Kullanıcı adı ve şifre gereklidir."})
    linux_creds.set(username, password)
    return {"success": True}

@app.get("/linux/credentials/check")
def linux_credentials_check():
    ok = linux_creds.is_valid()
    expires_in = 0
    if ok and linux_creds.expiry:
        expires_in = int((linux_creds.expiry - datetime.utcnow()).total_seconds())
    return {"valid": ok, "username": linux_creds.username if ok else None, "expiresIn": max(0, expires_in)}

@app.post("/linux/credentials/clear")
def linux_credentials_clear():
    linux_creds.clear()
    return {"success": True}

# ------------- LINUX BULK ADD -------------

def normalize_host(s: str) -> str:
    s = s.strip()
    s = s.strip(",;")
    return s

def is_valid_host(s: str) -> bool:
    # Lenient bir host/IP doğrulaması
    return bool(s) and bool(re.match(r"^[A-Za-z0-9_.:-]+$", s))

@app.post("/linux/servers/bulkAdd")
def linux_bulk_add(payload: Dict[str, Any] = Body(...)):
    """
    Body örneği:
    {
      "hosts": ["srv1", "10.0.0.5", "srv-02"],
      "existing": ["srv1"]  # opsiyonel, envanterinizden gelir
    }
    """
    hosts = payload.get("hosts") or []
    existing = set((payload.get("existing") or []))

    if not isinstance(hosts, list) or len(hosts) == 0:
        return JSONResponse(status_code=400, content={"success": False, "error": "hosts listesi gereklidir"})

    normalized = [normalize_host(h) for h in hosts if h and str(h).strip()]
    # Uniq
    seen = set()
    uniq = []
    for h in normalized:
        key = h.lower()
        if key not in seen:
            seen.add(key)
            uniq.append(h)

    invalid = [h for h in uniq if not is_valid_host(h)]
    valid = [h for h in uniq if is_valid_host(h)]

    # Duplicates: existing ile kesişim
    duplicates = [h for h in valid if h in existing]
    added = [h for h in valid if h not in existing]

    return {"success": True, "added": added, "duplicates": duplicates, "invalid": invalid}

# ------------- LINUX CONNECTIVITY / PATCH / REBOOT -------------

def ping_host(host: str) -> bool:
    try:
        cmd = ["ping", "-n", "1", host] if os.name == "nt" else ["ping", "-c", "1", host]
        r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=5)
        return r.returncode == 0
    except Exception:
        return False

def tcp_port_open(host: str, port: int) -> bool:
    try:
        if os.name == "nt":
            ps = [
                "powershell",
                "-NoProfile",
                "-Command",
                f"Test-NetConnection -ComputerName {host} -Port {port} | ConvertTo-Json"
            ]
            r = subprocess.run(ps, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=8)
            return r.returncode == 0 and b"TcpTestSucceeded" in r.stdout and b"true" in r.stdout.lower()
        else:
            r = subprocess.run(["bash", "-lc", f"nc -z {shlex.quote(host)} {port}"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=5)
            return r.returncode == 0
    except Exception:
        return False

@app.post("/linux/testConnection")
def linux_test_connection(payload: Dict[str, str] = Body(...)):
    """
    Body: { "host": "10.0.0.10" }
    Not: Gerçek SSH auth testi için paramiko/sshpass/ssh çağrısı ekleyebilirsin.
    Burada ping + TCP/22 port kontrolü yapıyoruz.
    """
    if not linux_creds.is_valid():
        return JSONResponse(status_code=401, content={"success": False, "error": "Kimlik bilgisi süresi doldu veya yok."})

    host = (payload.get("host") or "").strip()
    if not host:
        return JSONResponse(status_code=400, content={"success": False, "error": "host gereklidir"})

    # Ön kontroller
    if not ping_host(host):
        return {"success": False, "message": "Ping başarısız"}
    if not tcp_port_open(host, 22):
        return {"success": False, "message": "TCP/22 kapalı"}

    # Burada gerçek SSH ile 'hostname' vb. komut çalıştırmak istersen:
    # - Windows'a OpenSSH client kurulu olmalı
    # - subprocess ile: ssh -o StrictHostKeyChecking=no user@host 'hostname'
    # - Şifre geçme konusu: sshpass gibi araçlar gerekebilir. Güvenlik açısından dikkat et.
    return {"success": True, "message": "Reachable"}

@app.post("/linux/runPatch")
async def linux_run_patch(payload: Dict[str, Any] = Body(...)):
    """
    Body: { "hosts": ["srv1","10.0.0.5"] }
    Gerçek patch komutlarını SSH üstünden entegre etmen için yer: run_patch_on_host()
    """
    if not linux_creds.is_valid():
        return JSONResponse(status_code=401, content={"success": False, "error": "Kimlik bilgisi süresi doldu veya yok."})

    hosts = payload.get("hosts") or []
    if not isinstance(hosts, list) or len(hosts) == 0:
        return JSONResponse(status_code=400, content={"success": False, "error": "hosts listesi gereklidir"})

    creds = linux_creds.get()
    assert creds is not None
    user = creds["username"]
    pw = creds["password"]

    results = []

    async def run_patch_on_host(host: str) -> Dict[str, Any]:
        # Burada SSH ile apt/yum/dnf update & upgrade tetikleyeceğin gerçek kod olacak.
        # Örnek simülasyon:
        await asyncio.sleep(0.2)
        ok = True
        details = "OK"
        return {"host": host, "ok": ok, "details": details}

    # Paralel çalıştırma
    tasks = [run_patch_on_host(h) for h in hosts]
    for coro in asyncio.as_completed(tasks):
        r = await coro
        results.append(r)

    return {"success": True, "results": results}

# Linux reboot status
def default_linux_reboot_check(host: str, username: str) -> str:
    """
    Eğer sunucuda /run/reboot-required varsa (Debian/Ubuntu), RHEL için 'needs-restarting -r' vb.
    Burada gerçek SSH ile kontrol etmen gerekir.
    Şimdilik simülasyon: host içinde 'reboot' geçiyorsa 'REBOOT_REQUIRED' der.
    """
    return "REBOOT_REQUIRED" if "reboot" in host.lower() else "NO_REBOOT_NEEDED"

@app.get("/linux/reboot-status")
def reboot_status(
    host: str = Query(..., description="Linux sunucu hostname veya IP"),
    username: str = Query("root", description="Kullanıcı adı (default: root)")
):
    try:
        if external_linux_reboot_check:
            status = external_linux_reboot_check(host, username)
        else:
            status = default_linux_reboot_check(host, username)
        return {"server": host, "rebootStatus": status}
    except Exception as e:
        return JSONResponse(status_code=500, content={"server": host, "rebootStatus": f"ERROR: {e}"})

# Sunucuyu başlatmak için:
# uvicorn patch_backend:app --host 127.0.0.1 --port 5000

# npm run build
# npm run electron
# less /var/log/apt/history.log
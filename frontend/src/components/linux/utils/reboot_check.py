import subprocess

def check_reboot_status(server, user="root"):
    """
    server: ip veya hostname
    user: ssh user
    return: "REBOOT_REQUIRED" | "SERVICE_RESTART_REQUIRED" | "NO_REBOOT_NOR_RESTART" | "ERROR"
    """
    try:
        # 1. OS bilgisini çek
        os_info_cmd = f"ssh {user}@{server} 'cat /etc/os-release'"
        os_info = subprocess.check_output(os_info_cmd, shell=True, text=True)
        
        if "debian" in os_info.lower() or "ubuntu" in os_info.lower():
            # Ubuntu/Debian
            cmd = f"ssh {user}@{server} 'if [ -f /run/reboot-required ]; then echo REBOOT_REQUIRED; else echo NO_REBOOT_NOR_RESTART; fi'"
            return subprocess.check_output(cmd, shell=True, text=True).strip()

        elif "rhel" in os_info.lower() or "centos" in os_info.lower():
            # RHEL / CentOS
            cmd = f"ssh {user}@{server} 'needs-restarting -r >/dev/null 2>&1; if [ $? -eq 1 ]; then echo REBOOT_REQUIRED; else echo NO_REBOOT_NOR_RESTART; fi'"
            return subprocess.check_output(cmd, shell=True, text=True).strip()

        elif "suse" in os_info.lower():
            # SUSE
            cmd = f"ssh {user}@{server} 'zypper needs-rebooting >/dev/null 2>&1; if [ $? -eq 0 ]; then echo NO_REBOOT_NOR_RESTART; else echo REBOOT_REQUIRED; fi'"
            return subprocess.check_output(cmd, shell=True, text=True).strip()

        else:
            return "ERROR: OS not supported"

    except Exception as e:
        return f"ERROR: {e}"
import winrm


def authenticate_user(username, password, domain, dc_server):
    try:
        # WinRM ile domain controller'a bağlan (artık dinamik dc_server kullanıyor)
        session = winrm.Session(
            dc_server,  
            auth=(username, password),
            transport='ntlm'
        )
        
        # Basit bir komut çalıştır (whoami)
        result = session.run_cmd('whoami /groups')
        
        if result.status_code == 0:
            # Komut başarılı, kullanıcı doğrulandı
            output = result.std_out.decode('utf-8', errors='ignore')
            
            # "Domain Admins" grubunda mı kontrol et
            if "Domain Admins" in output or "BUILTIN\\Administrators" in output:
                return True, ""
            else:
                return False, "Kullanıcı Domain Admin grubunda değil. Lütfen yetkinizi kontrol ediniz."
        else:
            error_msg = result.std_err.decode('utf-8', errors='ignore') if result.std_err else "Bilinmeyen hata"
            return False, f"Kimlik doğrulama başarısız: {error_msg}"
            
    except Exception as e:
        error_str = str(e)
        # Türkçe hata mesajları
        if "credentials were rejected" in error_str or "401" in error_str:
            user_friendly = (
                "Kullanıcı adı veya şifre yanlış. Lütfen tekrar kontrol ediniz. "
                "Ayrıca WinRM servisinin Domain Controller'da açık olduğundan emin olun."
            )
        elif "getaddrinfo failed" in error_str or "NameResolutionError" in error_str:
            user_friendly = (
                f"Domain Controller ({dc_server}) adresine ulaşılamıyor. "
                "Lütfen DC Server adresini kontrol ediniz ve WinRM servisinin açık olduğundan emin olun."
            )
        else:
            user_friendly = f"Bağlantı hatası: {error_str}"
        
        return False, user_friendly
import React from 'react';

const AuthenticationModal = ({
  isAuthenticated,
  authUsername,
  setAuthUsername,
  authPassword,
  setAuthPassword,
  authDomain,
  setAuthDomain,
  authDcServer,
  setAuthDcServer,
  authError,
  attemptCount,
  isLocked,
  handleInitialAuth
}) => {
  if (isAuthenticated) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: "white",
        padding: 30,
        borderRadius: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        width: 350,
        textAlign: "center"
      }}>
        <h2 style={{ marginBottom: 20, color: "#333" }}>Admin Girişi</h2>
        <form onSubmit={handleInitialAuth}>
          <div style={{ marginBottom: 15 }}>
            <input
              type="text"
              placeholder="Domain Name *örnek:FTS,"
              value={authDomain}
              onChange={(e) => setAuthDomain(e.target.value)}
              disabled={isLocked}
              style={{
                width: "100%",
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 5,
                fontSize: 14
              }}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 15 }}>
            <input
              type="text"
              placeholder="Domain Controller Hostname*örnek:dcsrv.fts.com"
              value={authDcServer}
              onChange={(e) => setAuthDcServer(e.target.value)}
              disabled={isLocked}
              style={{
                width: "100%",
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 5,
                fontSize: 14
              }}
            />
          </div>
          <div style={{ marginBottom: 15 }}>
            <input
              type="text"
              placeholder="Domain Kullanıcı Adı"
              value={authUsername}
              onChange={(e) => setAuthUsername(e.target.value)}
              disabled={isLocked}
              style={{
                width: "100%",
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 5,
                fontSize: 14
              }}
            />
          </div>
          <div style={{ marginBottom: 15 }}>
            <input
              type="password"
              placeholder="Şifre"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              disabled={isLocked}
              style={{
                width: "100%",
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 5,
                fontSize: 14
              }}
            />
          </div>
          {authError && (
            <div style={{
              color: "#dc3545",
              fontSize: 13,
              marginBottom: 15,
              textAlign: "left"
            }}>
              {authError}
            </div>
          )}
          <button
            type="submit"
            disabled={isLocked}
            style={{
              width: "100%",
              padding: 12,
              backgroundColor: isLocked ? "#6c757d" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: 5,
              fontSize: 16,
              cursor: isLocked ? "not-allowed" : "pointer"
            }}
          >
            {isLocked ? "Çok Fazla Deneme" : "Giriş Yap"}
          </button>
          {!isLocked && attemptCount > 0 && (
            <div style={{ fontSize: 12, color: "#6c757d", marginTop: 10 }}>
              Kalan deneme: {5 - attemptCount}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthenticationModal;
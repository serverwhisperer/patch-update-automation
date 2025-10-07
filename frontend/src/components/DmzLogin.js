import React, { useState } from 'react';

const DmzLogin = ({
  serverName,
  dmzUsername,
  dmzPassword,
  onSave,
  onCancel
}) => {
  const [username, setUsername] = useState(dmzUsername || "");
  const [password, setPassword] = useState(dmzPassword || "");

  return (
    <div style={{
      padding: 24,
      background: "#fff",
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      width: 320,
      margin: "0 16px",
      position: "relative",
      zIndex: 10000,
      pointerEvents: "auto"
    }}>
      <h3 style={{ marginBottom: 16, textAlign: "center", color: "#1976d2" }}>
        {serverName} Sunucu Girişi
      </h3>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Kullanıcı Adı</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 4,
            border: "1px solid #ccc",
            boxSizing: "border-box"
          }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Şifre</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 4,
            border: "1px solid #ccc",
            boxSizing: "border-box"
          }}
        />
      </div>
      <button
        onClick={() => onSave(username, password)}
        style={{
          width: "100%",
          padding: 10,
          background: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Kaydet
      </button>
      <button
        onClick={onCancel}
        style={{
          width: "100%",
          padding: 10,
          background: "#eee",
          color: "#333",
          border: "none",
          borderRadius: 4,
          marginTop: 8,
          cursor: "pointer"
        }}
      >
        İptal
      </button>
    </div>
  );
};

export default DmzLogin;
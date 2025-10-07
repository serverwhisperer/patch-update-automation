import React from "react";

export default function ServerForm({ newServer, onChange, onAdd }) {
  return (
    <div style={{ marginBottom: 16, padding: 15, border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
      <h4 style={{ marginTop: 0, marginBottom: 10 }}>Add New Server</h4>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          placeholder="Host/IP"
          value={newServer.host}
          onChange={(e) => onChange('host', e.target.value)}
        />
        <input
          placeholder="Username"
          value={newServer.username}
          onChange={(e) => onChange('username', e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={newServer.password}
          onChange={(e) => onChange('password', e.target.value)}
        />
        <button onClick={onAdd}>Add Server</button>
      </div>
    </div>
  );
}
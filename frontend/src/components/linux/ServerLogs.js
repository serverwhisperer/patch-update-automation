import React from "react";

export default function ServerLogs({ activeServer, servers, serverLogs, onClearLogs, onCloseLogs }) {
  const currentServer = servers.find((s) => s.id === activeServer);

  // Buton stillerini burada
  const dangerButtonStyle = {
    padding: '8px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
    fontWeight: '500',
    fontSize: '14px',
    backgroundColor: '#dc3545',
    color: 'white'
  };

  const secondaryButtonStyle = {
    padding: '8px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
    fontWeight: '500',
    fontSize: '14px',
    backgroundColor: '#6c757d',
    color: 'white'
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ marginBottom: 10 }}>
        Server Logs {activeServer && `- ${currentServer?.host}`}
      </h3>
      {activeServer && (
        <div style={{ marginBottom: 10, display: 'flex', gap: '10px' }}>
          <button onClick={onClearLogs} style={dangerButtonStyle}>
            Clear Logs
          </button>
          <button onClick={onCloseLogs} style={secondaryButtonStyle}>
            Close Logs
          </button>
        </div>
      )}
      <textarea
        readOnly
        value={activeServer ? (serverLogs[activeServer] || []).join('\n') : 'Select a server to view logs...'}
        style={{ 
          width: '100%', 
          height: 250, 
          fontFamily: 'Consolas, Monaco, monospace', 
          fontSize: '13px',
          padding: '15px',
          border: '1px solid #ced4da',
          borderRadius: '6px',
          backgroundColor: '#f8f9fa',
          resize: 'vertical',
          lineHeight: '1.4'
        }}
      />
    </div>
  );
}
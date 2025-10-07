// components/linux/ConfirmModal.jsx
import React from "react";

export default function ConfirmModal({ show, serverName, onConfirm, onCancel }) {
  if (!show) return null;

  // Buton stillerini burada tanımlayalım veya utils/styles.js'den alalım
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        minWidth: '300px',
        textAlign: 'center'
      }}>
        <h4 style={{ marginTop: 0, marginBottom: 15, color: '#495057' }}>
          Confirm Clear Logs
        </h4>
        <p style={{ marginBottom: 20, color: '#6c757d' }}>
          Are you sure you want to clear logs for <strong>{serverName}</strong>?
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={onConfirm} style={dangerButtonStyle}>
            Yes, Clear
          </button>
          <button onClick={onCancel} style={secondaryButtonStyle}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
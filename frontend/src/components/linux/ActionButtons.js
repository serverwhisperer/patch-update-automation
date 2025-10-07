// components/linux/ActionButtons.jsx
import React from "react";

export default function ActionButtons({ onTest, onCheck, onApply, onReboot }) {
  const buttonStyle = {
    padding: '8px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
    fontWeight: '500',
    fontSize: '14px'
  };

  const successButtonStyle = { ...buttonStyle, backgroundColor: '#28a745', color: 'white' };
  const infoButtonStyle    = { ...buttonStyle, backgroundColor: '#17a2b8', color: 'white' };
  const warningButtonStyle = { ...buttonStyle, backgroundColor: '#ffc107', color: '#212529' };
  const dangerButtonStyle  = { ...buttonStyle, backgroundColor: '#dc3545', color: 'white' };

  return (
    <div style={{ marginBottom: 20, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <button onClick={onTest} style={successButtonStyle}>
        Test Connection
      </button>
      <button onClick={onCheck} style={infoButtonStyle}>
        Check Updates
      </button>
      <button onClick={onApply} style={warningButtonStyle}>
        Apply Updates
      </button>
      <button onClick={onReboot} style={dangerButtonStyle}>
        Reboot
      </button>
    </div>
  );
}
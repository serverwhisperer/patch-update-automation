import React from 'react';

function PlatformSelector() {
  const openPanelNewWindow = async (platform) => {
    // Preload ile expose edilen API'yi kullan
    if (window.electronAPI && window.electronAPI.openWindow) {
      await window.electronAPI.openWindow(`/${platform}`, { width: 1100, height: 800 });
    } else {
      // fallback: tarayıcıda çalışıyorsan sadece navigate et
      window.location.hash = `#/${platform}`;
    }
  };

  const btnStyle = {
    padding: '16px 20px',
    fontSize: '18px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    cursor: 'pointer',
    minWidth: '320px',
    margin: '10px',
    backgroundColor: '#f8f9fa',
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px',
  };

  const titleStyle = {
    fontSize: '22px',
    marginBottom: '12px',
    color: '#333',
    fontWeight: 600,
  };

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>Easy Patch</div>
      <button onClick={() => openPanelNewWindow('windows')} style={btnStyle}>
        Easy Patch for Windows Servers
      </button>
      <button onClick={() => openPanelNewWindow('linux')} style={btnStyle}>
        Easy Patch for Linux Server
      </button>
    </div>
  );
}

export default PlatformSelector;
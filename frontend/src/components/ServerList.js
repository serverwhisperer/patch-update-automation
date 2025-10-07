import React from 'react';

const ServerList = ({
  servers,
  setServers,
  selectedServers,
  showAdd,
  setShowAdd,
  newHost,
  setNewHost,
  handleAddServer,
  editingIndex,
  setEditingIndex,
  editHost,
  setEditHost,
  handleEditServer,
  handleSaveEdit,
  handleCancelEdit,
  handleRemoveServer,
  handleToggleDMZ,
  handleTestConnection,
  handleScan,
  handleBulkTestConnection,
  handleBulkScan,
  handleBulkPatchUpdate,
  handleSelectAll,
  handleServerSelect,
  connectionStatus,
  errorLogs,
  showLogs,
  setShowLogs,
  hasErrors,
  handleFileUpload,
  fileInputRef,
  onDmzLogin
}) => {
  return (
    <div style={{ marginLeft: 180 }}>
      <h2>Sunucu Listesi</h2>
      
      {/* Üst Butonlar */}
      <div style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <button onClick={() => setShowAdd(true)}>Sunucu Ekle</button>
        
        <label style={{ cursor: "pointer" }}>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            ref={fileInputRef}
          />
          <span style={{ 
            backgroundColor: "#007bff", 
            color: "white", 
            padding: "6px 12px", 
            borderRadius: 4, 
            border: "none",
            cursor: "pointer"
          }}>
            Dosyadan Seç
          </span>
        </label>

        {/* Toplu İşlem Butonları */}
        <button 
          onClick={handleBulkTestConnection}
          disabled={selectedServers.length === 0}
          style={{ 
            backgroundColor: selectedServers.length === 0 ? "#ccc" : "#17a2b8", 
            color: "white", 
            border: "none", 
            padding: "6px 12px", 
            borderRadius: 4,
            cursor: selectedServers.length === 0 ? "not-allowed" : "pointer"
          }}
        >
          Toplu Test Connection ({selectedServers.length})
        </button>

        <button 
          onClick={handleBulkScan}
          disabled={selectedServers.length === 0}
          style={{ 
            backgroundColor: selectedServers.length === 0 ? "#ccc" : "#28a745", 
            color: "white", 
            border: "none", 
            padding: "6px 12px", 
            borderRadius: 4,
            cursor: selectedServers.length === 0 ? "not-allowed" : "pointer"
          }}
        >
          Toplu Scan ({selectedServers.length})
        </button>

        <button 
          onClick={handleBulkPatchUpdate}
          disabled={selectedServers.length === 0}
          style={{ 
            backgroundColor: selectedServers.length === 0 ? "#ccc" : "#fd7e14", 
            color: "white", 
            border: "none", 
            padding: "6px 12px", 
            borderRadius: 4,
            cursor: selectedServers.length === 0 ? "not-allowed" : "pointer"
          }}
        >
          Toplu Patch Update ({selectedServers.length})
        </button>

        {/* Tümünü Seç/Temizle */}
        {servers.length > 0 && (
          <button 
            onClick={handleSelectAll}
            style={{ 
              backgroundColor: "#6c757d", 
              color: "white", 
              border: "none", 
              padding: "6px 12px", 
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            {selectedServers.length === servers.length ? "Tümünü Temizle" : "Tümünü Seç"}
          </button>
        )}
        
        {hasErrors && (
          <button 
            onClick={() => setShowLogs(!showLogs)} 
            style={{ backgroundColor: "#ff6b6b", color: "white", border: "none", padding: "6px 12px", borderRadius: 4 }}
          >
            {showLogs ? "Hata Loglarını Gizle" : "Hata Logları"}
          </button>
        )}
      </div>

      {/* Sunucu Ekleme Formu */}
      {showAdd && (
        <div style={{ margin: "20px 0", padding: 10, border: "1px solid #ccc", borderRadius: 4 }}>
          <input
            type="text"
            placeholder="Hostname"
            value={newHost}
            onChange={(e) => setNewHost(e.target.value)}
            style={{ marginRight: 10 }}
          />
          <button onClick={handleAddServer}>Ekle</button>
          <button onClick={() => setShowAdd(false)} style={{ marginLeft: 10 }}>
            İptal
          </button>
        </div>
      )}

      {/* Sunucu Listesi */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {servers.map((server, idx) => (
          <li
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 10,
              borderBottom: "1px solid #eee",
              paddingBottom: 5,
              backgroundColor: server.isDMZ ? "#fff3cd" : "transparent"
            }}
          >
            {editingIndex === idx ? (
              <>
                {/* Düzenleme Modu */}
                <input
                  type="checkbox"
                  checked={selectedServers.includes(idx)}
                  onChange={() => handleServerSelect(idx)}
                  style={{ marginRight: 10 }}
                  disabled
                />
                <input
                  type="text"
                  value={editHost}
                  onChange={(e) => setEditHost(e.target.value)}
                  style={{ flex: 1, marginRight: 10 }}
                />
                <button onClick={handleSaveEdit} style={{ marginRight: 5, backgroundColor: "#28a745", color: "white", border: "none", padding: "3px 8px", borderRadius: 3, fontSize: 12 }}>
                  Kaydet
                </button>
                <button onClick={handleCancelEdit} style={{ marginRight: 10, backgroundColor: "#6c757d", color: "white", border: "none", padding: "3px 8px", borderRadius: 3, fontSize: 12 }}>
                  İptal
                </button>
              </>
            ) : (
              <>
                {/* Normal Görünüm */}
                <input
                  type="checkbox"
                  checked={selectedServers.includes(idx)}
                  onChange={() => handleServerSelect(idx)}
                  style={{ marginRight: 10 }}
                />
                <span style={{ flex: 1 }}>
                  <b>{server.host}</b> {server.isDMZ && <span style={{ color: "#856404", fontSize: 12 }}>(DMZ)</span>}
                </span>
                <button onClick={() => handleTestConnection(server)} style={{ marginRight: 10 }}>
                  Test Connection
                </button>
                {connectionStatus[server.host] === "pending" && (
                  <span style={{ color: "orange", marginRight: 10 }}>Bağlanıyor...</span>
                )}
                {connectionStatus[server.host] === "success" && (
                  <span style={{ color: "green", marginRight: 10 }}>Başarılı</span>
                )}
                {connectionStatus[server.host] === "fail" && (
                  <span style={{ color: "red", marginRight: 10 }}>İşlem Başarısız</span>
                )}
                <button onClick={() => handleScan(server)} style={{ marginRight: 10 }}>Scan</button>
                <button 
                  onClick={() => handleToggleDMZ(idx)} 
                  style={{ 
                    backgroundColor: server.isDMZ ? "#dc3545" : "#ffc107", 
                    color: server.isDMZ ? "white" : "black", 
                    border: "none", 
                    padding: "3px 8px", 
                    borderRadius: 3, 
                    fontSize: 12, 
                    marginRight: 5 
                  }}
                >
                  {server.isDMZ ? "DMZ Kaldır" : "DMZ Yap"}
                </button>
                {server.isDMZ && (
                  <button
                    onClick={() => onDmzLogin(server)}
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      padding: "3px 8px",
                      borderRadius: 3,
                      fontSize: 12,
                      marginRight: 5
                    }}
                  >
                    DMZ Girişi
                  </button>
                )}
                <button 
                  onClick={() => handleEditServer(idx)} 
                  style={{ backgroundColor: "#17a2b8", color: "white", border: "none", padding: "3px 8px", borderRadius: 3, fontSize: 12, marginRight: 5 }}
                >
                  Düzenle
                </button>
                <button 
                  onClick={() => handleRemoveServer(idx)} 
                  style={{ backgroundColor: "#dc3545", color: "white", border: "none", padding: "3px 8px", borderRadius: 3, fontSize: 12 }}
                >
                  Kaldır
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServerList;
import React, { useState } from "react";
import ServerRow from "./ServerRow";

export default function ServerTable({
  servers,
  selected,
  onToggle,
  serverOS,
  status,
  renderStatus,
  serverUpdates,
  serverReboot,
  onViewLogs,
  onRefresh,
  onAddHosts,  // ✅ YENİ PROP
}) {
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [fileName, setFileName] = useState("");
  const [hosts, setHosts] = useState([]);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const text = await f.text();
    const list = text
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("#"));
    setHosts(list);
  };

  const bulkAdd = () => {
    if (!hosts.length) return alert("TXT dosyasında geçerli bir satır yok.");
    
    // ✅ Backend'e POST atmıyoruz; direkt parent'a bildiriyoruz
    if (typeof onAddHosts === "function") {
      onAddHosts(hosts);
    }

    // Modal'ı kapat ve state'i temizle
    setShowBulkModal(false);
    setFileName("");
    setHosts([]);
  };

  if (!servers || servers.length === 0) {
    return (
      <div>
        {/* Üst aksiyon bar (liste boş olsa bile toplu ekleme yapılabilsin) */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <h3>Sunucular</h3>
          <div>
            <button onClick={() => setShowBulkModal(true)}>TXT'den Toplu Ekle</button>
          </div>
        </div>
        <div style={{ color: "#666", marginBottom: 12 }}>Listede sunucu yok.</div>

        {/* Modal */}
        {showBulkModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div style={{ background: "#fff", padding: 16, width: 500, borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4>TXT'den Toplu Sunucu Ekle</h4>
                <button
                  onClick={() => {
                    setShowBulkModal(false);
                    setFileName("");
                    setHosts([]);
                  }}
                >
                  Kapat
                </button>
              </div>

              <input type="file" accept=".txt" onChange={onFile} />
              {fileName && (
                <div style={{ marginTop: 6 }}>
                  Seçilen dosya: <b>{fileName}</b> — {hosts.length} satır
                </div>
              )}

              {hosts.length > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    maxHeight: 150,
                    overflow: "auto",
                    border: "1px solid #ddd",
                    padding: 8,
                    borderRadius: 6,
                    background: "#fafafa",
                  }}
                >
                  {hosts.map((h, i) => (
                    <div key={i} style={{ fontFamily: "monospace" }}>
                      {h}
                    </div>
                  ))}
                </div>
              )}

              <button style={{ marginTop: 12 }} onClick={bulkAdd} disabled={!hosts.length}>
                Uygula (Listeye Ekle)
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Üst aksiyon bar */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <h3>Sunucular</h3>
        <div>
          <button onClick={() => setShowBulkModal(true)}>TXT'den Toplu Ekle</button>
        </div>
      </div>

      <div style={{ maxHeight: "500px", overflowY: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: 20,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            tableLayout: "fixed",
            border: "1px solid #dee2e6",
          }}
        >
          <colgroup>
            <col style={{ width: "70px" }} /> {/* Select */}
            <col style={{ width: "180px" }} /> {/* Host */}
            <col style={{ width: "120px" }} /> {/* User */}
            <col style={{ width: "100px" }} /> {/* OS Type */}
            <col style={{ width: "120px" }} /> {/* Status */}
            <col style={{ width: "260px" }} /> {/* Update Summary */}
            <col style={{ width: "100px" }} /> {/* Logs */}
          </colgroup>

          <thead
            style={{
              backgroundColor: "#343a40",
              color: "white",
              position: "sticky",
              top: 0,
              zIndex: 2,
            }}
          >
            <tr>
              <th style={{ padding: "12px 8px", textAlign: "center", border: "1px solid #dee2e6" }}>Select</th>
              <th style={{ padding: "12px 8px", textAlign: "center", border: "1px solid #dee2e6" }}>Host</th>
              <th style={{ padding: "12px 8px", textAlign: "center", border: "1px solid #dee2e6" }}>User</th>
              <th style={{ padding: "12px 8px", textAlign: "center", border: "1px solid #dee2e6" }}>OS Type</th>
              <th style={{ padding: "12px 8px", textAlign: "center", border: "1px solid #dee2e6" }}>Status</th>
              <th style={{ padding: "12px 8px", textAlign: "center", border: "1px solid #dee2e6" }}>Update Summary</th>
              <th style={{ padding: "12px 8px", textAlign: "center", border: "1px solid #dee2e6" }}>Logs</th>
            </tr>
          </thead>

          <tbody>
            {servers.map((srv, index) => (
              <ServerRow
                key={srv.id}
                srv={srv}
                index={index}
                selected={selected}
                onToggle={onToggle}
                serverOS={serverOS}
                status={status}
                renderStatus={renderStatus}
                serverUpdates={serverUpdates}
                serverReboot={serverReboot}
                onViewLogs={onViewLogs}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showBulkModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div style={{ background: "#fff", padding: 16, width: 500, borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4>TXT'den Toplu Sunucu Ekle</h4>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setFileName("");
                  setHosts([]);
                }}
              >
                Kapat
              </button>
            </div>

            <input type="file" accept=".txt" onChange={onFile} />
            {fileName && (
              <div style={{ marginTop: 6 }}>
                Seçilen dosya: <b>{fileName}</b> — {hosts.length} satır
              </div>
            )}

            {hosts.length > 0 && (
              <div
                style={{
                  marginTop: 8,
                  maxHeight: 150,
                  overflow: "auto",
                  border: "1px solid #ddd",
                  padding: 8,
                  borderRadius: 6,
                  background: "#fafafa",
                }}
              >
                {hosts.map((h, i) => (
                  <div key={i} style={{ fontFamily: "monospace" }}>
                    {h}
                  </div>
                ))}
              </div>
            )}

            <button style={{ marginTop: 12 }} onClick={bulkAdd} disabled={!hosts.length}>
              Uygula (Listeye Ekle)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
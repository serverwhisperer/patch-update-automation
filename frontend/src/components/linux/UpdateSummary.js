import React from "react";

export default function UpdateSummary({ updates, rebootStatus }) {
  if (!updates) return <span style={{ color: "gray" }}>No data</span>;

  return (
    <div style={{ fontSize: "13px", lineHeight: "1.4", textAlign: "center" }}>
      <div>
        📦 Total: <strong>{updates.total}</strong>
      </div>
      {updates.critical > 0 && (
        <div style={{ color: "red" }}>
          ⚠️ Critical: <strong>{updates.critical}</strong>
        </div>
      )}
      {updates.normal > 0 && (
        <div style={{ color: "orange" }}>
          Regular: <strong>{updates.normal}</strong>
        </div>
      )}

      {/* ♻️ Reboot info */}
      {rebootStatus === "REBOOT_REQUIRED" && (
        <div style={{ color: "red", fontWeight: "bold" }}>
          ♻️ Restart Required ⚠️
        </div>
      )}
      {rebootStatus === "NO_REBOOT_NOR_RESTART" && (
        <div style={{ color: "green" }}>
          ♻️ No Reboot Needed ✅
        </div>
      )}
      {!rebootStatus && (
        <div style={{ color: "gray" }}>♻️ Unknown</div>
      )}
    </div>
  );
}
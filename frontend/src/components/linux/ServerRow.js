import React from "react";
import UpdateSummary from "./UpdateSummary";

export default function ServerRow({
  srv,
  index,
  selected,
  onToggle,
  serverOS,
  renderStatus,
  serverUpdates,
  serverReboot,   // ✅ buradan alınacak
  onViewLogs,
}) {
  return (
    <tr
      style={{
        backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
      }}
    >
      <td style={{ padding: "10px 8px", textAlign: "center", border: "1px solid #dee2e6" }}>
        <input
          type="checkbox"
          checked={selected.includes(srv.id)}
          onChange={() => onToggle(srv.id)}
          style={{ transform: "scale(1.2)", cursor: "pointer" }}
        />
      </td>

      <td style={{ padding: "10px 8px", fontWeight: "500", border: "1px solid #dee2e6", textAlign: "center" }}>
        {srv.host}
      </td>

      <td style={{ padding: "10px 8px", border: "1px solid #dee2e6", textAlign: "center" }}>
        {srv.username}
      </td>

      <td style={{ padding: "10px 8px", border: "1px solid #dee2e6", textAlign: "center" }}>
        <span
          style={{
            padding: "2px 8px",
            backgroundColor: "#e9ecef",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "500",
            display: "inline-block",
            minWidth: "70px",
            textAlign: "center",
          }}
        >
          {serverOS[srv.id]?.osType || "Unknown"}
        </span>
      </td>

      <td style={{ padding: "10px 8px", border: "1px solid #dee2e6", textAlign: "center" }}>
        {renderStatus(srv.id)}
      </td>

      {/* 🔹 Update Summary: artık burada reboot bilgisini de gösteriyoruz */}
      <td style={{ padding: "10px 8px", border: "1px solid #dee2e6", textAlign: "center" }}>
        <UpdateSummary
          updates={serverUpdates[srv.id]}
          rebootStatus={serverReboot[srv.id]}   // ✅ rebootStatus geçiliyor
        />
      </td>

      <td style={{ padding: "10px 8px", textAlign: "center", border: "1px solid #dee2e6" }}>
        <button
          onClick={() => onViewLogs(srv.id)}
          style={{
            padding: "6px 12px",
            fontSize: "12px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          View Logs
        </button>
      </td>
    </tr>
  );
}
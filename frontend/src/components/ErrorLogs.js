import React from 'react';

const ErrorLogs = ({ showLogs, hasErrors, errorLogs }) => {
  if (!showLogs || !hasErrors) return null;

  return (
    <div style={{ 
      marginTop: 30, 
      padding: 15, 
      backgroundColor: "#f8f9fa", 
      border: "1px solid #dee2e6", 
      borderRadius: 8,
      maxHeight: 300,
      overflowY: "auto"
    }}>
      <h3 style={{ margin: "0 0 15px 0", color: "#dc3545" }}>🔍 Hata Logları</h3>
      {Object.entries(errorLogs).map(([host, error]) => (
        <div key={host} style={{ 
          marginBottom: 10, 
          padding: 8, 
          backgroundColor: "#fff3cd", 
          border: "1px solid #ffeaa7", 
          borderRadius: 4,
          fontSize: 14
        }}>
          <strong style={{ color: "#856404" }}>{host}:</strong>
          <div
              style={{ color: "#721c24", marginTop: 4 }}
              dangerouslySetInnerHTML={{ __html: error }}
            />
        </div>
      ))}
    </div>
  );
};

export default ErrorLogs;
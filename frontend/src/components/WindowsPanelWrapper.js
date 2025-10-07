import React, { useState, useRef } from 'react';
import AuthenticationModal from './AuthenticationModal';
import DmzLogin from './DmzLogin';
import ServerList from './ServerList';
import ErrorLogs from './ErrorLogs';

const apiUrl = process.env.REACT_APP_API_URL;

function WindowsPanelWrapper() {
  // File input ref
  const fileInputRef = useRef();

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [authDcServer, setAuthDcServer] = useState('');
  const [authError, setAuthError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Server states
  const [servers, setServers] = useState([]);
  const [selectedServers, setSelectedServers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newHost, setNewHost] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editHost, setEditHost] = useState('');
  const [connectionStatus, setConnectionStatus] = useState({});
  const [errorLogs, setErrorLogs] = useState({});
  const [showLogs, setShowLogs] = useState(false);
  const hasErrors = Object.keys(errorLogs).length > 0;

  // DMZ giriş paneli için seçili sunucu
  const [selectedDmzServer, setSelectedDmzServer] = useState(null);

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthUsername('');
    setAuthPassword('');
    setAuthDomain('');
    setAuthDcServer('');
    setAuthError('');
    setAttemptCount(0);
    setIsLocked(false);
    setServers([]);
    setSelectedServers([]);
    setConnectionStatus({});
    setErrorLogs({});
    setShowLogs(false);
    setShowAdd(false);
    setEditingIndex(-1);
    setEditHost('');
    setNewHost('');
    setSelectedDmzServer(null);
  };

  // Authentication handler
  const handleInitialAuth = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    try {
      const res = await fetch(
        `${apiUrl}/authenticate?username=${encodeURIComponent(authUsername)}&password=${encodeURIComponent(authPassword)}&domain=${encodeURIComponent(authDomain)}&dc_server=${encodeURIComponent(authDcServer)}`
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setAuthError('');
        setAttemptCount(0);
      } else {
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);
        setAuthError(data.error || `Giriş başarısız. Kalan deneme: ${5 - newAttemptCount}`);
        if (newAttemptCount >= 5) {
          setIsLocked(true);
          setAuthError('Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.');
        }
      }
    } catch (error) {
      setAuthError('Bağlantı hatası: ' + error.message);
    }
  };

  // Server management handlers
  const handleAddServer = () => {
    if (newHost.trim()) {
      setServers([...servers, { host: newHost.trim(), isDMZ: false, dmzUsername: '', dmzPassword: '' }]);
      setNewHost('');
      setShowAdd(false);
    }
  };

  const handleEditServer = (index) => {
    setEditingIndex(index);
    setEditHost(servers[index].host);
  };

  const handleSaveEdit = () => {
    if (editHost.trim()) {
      const updatedServers = [...servers];
      updatedServers[editingIndex] = { ...updatedServers[editingIndex], host: editHost.trim() };
      setServers(updatedServers);
      setEditingIndex(-1);
      setEditHost('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(-1);
    setEditHost('');
  };

  const handleRemoveServer = (index) => {
    const updatedServers = servers.filter((_, i) => i !== index);
    setServers(updatedServers);
    setSelectedServers(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  const handleToggleDMZ = (index) => {
    const updatedServers = [...servers];
    updatedServers[index].isDMZ = !updatedServers[index].isDMZ;
    if (updatedServers[index].isDMZ && (!updatedServers[index].dmzUsername || !updatedServers[index].dmzPassword)) {
      updatedServers[index].dmzUsername = '';
      updatedServers[index].dmzPassword = '';
    }
    setServers(updatedServers);
  };

  // Sunucu seçim işlemleri
  const handleSelectAll = () => {
    if (selectedServers.length === servers.length) {
      setSelectedServers([]);
    } else {
      setSelectedServers(servers.map((_, index) => index));
    }
  };

  const handleServerSelect = (index) => {
    setSelectedServers(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // DMZ giriş panelini aç
  const handleOpenDmzLogin = (server) => {
    setSelectedDmzServer(server);
  };

  // DMZ user/pass kaydet
  const handleSaveDmzCredentials = (username, password) => {
    const updatedServers = servers.map(s =>
      s.host === selectedDmzServer.host
        ? { ...s, dmzUsername: username, dmzPassword: password }
        : s
    );
    setServers(updatedServers);
    setSelectedDmzServer(null);
  };

  // Test connection handler
  const handleTestConnection = async (server) => {
    const testUsername = server.isDMZ ? server.dmzUsername : authUsername;
    const testPassword = server.isDMZ ? server.dmzPassword : authPassword;

    if (!testUsername || !testPassword) {
      alert(server.isDMZ ? 'DMZ kullanıcı bilgileri eksik!' : 'Kullanıcı bilgileri eksik!');
      return;
    }

    setConnectionStatus(prev => ({ ...prev, [server.host]: 'pending' }));

    try {
      const res = await fetch(
        `${apiUrl}/test-connection?host=${server.host}&username=${encodeURIComponent(testUsername)}&password=${encodeURIComponent(testPassword)}`
      );
      if (res.ok) {
        setConnectionStatus(prev => ({ ...prev, [server.host]: 'success' }));
        setErrorLogs(prev => {
          const newLogs = { ...prev };
          delete newLogs[server.host];
          return newLogs;
        });
      } else {
        let errorText;
        try {
          const errorJson = await res.json();
          errorText = errorJson.error || JSON.stringify(errorJson);
        } catch {
          errorText = await res.text();
        }
        setConnectionStatus(prev => ({ ...prev, [server.host]: 'fail' }));
        setErrorLogs(prev => ({ ...prev, [server.host]: errorText }));
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [server.host]: 'fail' }));
      setErrorLogs(prev => ({ ...prev, [server.host]: error.message }));
    }
  };

  // Scan handler
  const handleScan = async (server) => {
    const testUsername = server.isDMZ ? server.dmzUsername : authUsername;
    const testPassword = server.isDMZ ? server.dmzPassword : authPassword;

    if (!testUsername || !testPassword) {
      alert(server.isDMZ ? 'DMZ kullanıcı bilgileri eksik!' : 'Kullanıcı bilgileri eksik!');
      return;
    }

    try {
      const res = await fetch(
        `${apiUrl}/scan?host=${server.host}&username=${encodeURIComponent(testUsername)}&password=${encodeURIComponent(testPassword)}`
      );
      if (res.ok) {
        const result = await res.text();
        alert(`Scan sonucu:\n${result}`);
      } else {
        let errorText;
        try {
          const errorJson = await res.json();
          errorText = errorJson.error || JSON.stringify(errorJson);
        } catch {
          errorText = await res.text();
        }
        alert(`Scan hatası: ${errorText}`);
        setErrorLogs(prev => ({ ...prev, [server.host]: errorText }));
      }
    } catch (error) {
      alert(`Scan hatası: ${error.message}`);
      setErrorLogs(prev => ({ ...prev, [server.host]: error.message }));
    }
  };

  // Toplu Test Connection handler
  const handleBulkTestConnection = async () => {
    if (selectedServers.length === 0) {
      alert('Lütfen en az bir sunucu seçin!');
      return;
    }

    const selectedServerObjects = selectedServers.map(index => servers[index]);
    
    for (const server of selectedServerObjects) {
      await handleTestConnection(server);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // Toplu Scan handler
  const handleBulkScan = async () => {
    if (selectedServers.length === 0) {
      alert('Lütfen en az bir sunucu seçin!');
      return;
    }

    const selectedServerObjects = selectedServers.map(index => servers[index]);
    
    for (const server of selectedServerObjects) {
      await handleScan(server);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // Toplu Patch Update handler
  const handleBulkPatchUpdate = async () => {
    if (selectedServers.length === 0) {
      alert('Lütfen en az bir sunucu seçin!');
      return;
    }

    const selectedServerObjects = selectedServers.map(index => servers[index]);
    
    for (const server of selectedServerObjects) {
      const testUsername = server.isDMZ ? server.dmzUsername : authUsername;
      const testPassword = server.isDMZ ? server.dmzPassword : authPassword;

      if (!testUsername || !testPassword) {
        alert(`${server.host} için ${server.isDMZ ? 'DMZ' : ''} kullanıcı bilgileri eksik!`);
        continue;
      }

      try {
        const res = await fetch(
          `${apiUrl}/patch-update?host=${server.host}&username=${encodeURIComponent(testUsername)}&password=${encodeURIComponent(testPassword)}`
        );
        if (res.ok) {
          const result = await res.text();
          alert(`${server.host} Patch Update sonucu:\n${result}`);
        } else {
          let errorText;
          try {
            const errorJson = await res.json();
            errorText = errorJson.error || JSON.stringify(errorJson);
          } catch {
            errorText = await res.text();
          }
          alert(`${server.host} Patch Update hatası: ${errorText}`);
          setErrorLogs(prev => ({ ...prev, [server.host]: errorText }));
        }
      } catch (error) {
        alert(`${server.host} Patch Update hatası: ${error.message}`);
        setErrorLogs(prev => ({ ...prev, [server.host]: error.message }));
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        const lines = content
          .split("\n")
          .map(line => line.trim())
          .filter(line => line.length > 0);

        setServers(prevServers => {
          const existingHosts = prevServers.map(s => s.host.trim().toLowerCase());

          const newServers = lines
            .filter(line => {
              const host = line.replace(/\s+[dD]$/, '').toLowerCase();
              return !existingHosts.includes(host);
            })
            .map(line => {
              const isDMZ = /\s+[dD]$/.test(line);
              const host = line.replace(/\s+[dD]$/, '').trim();
              return {
                host,
                isDMZ,
                dmzUsername: '',
                dmzPassword: ''
              };
            });

          if (newServers.length === 0) {
            alert("Eklenebilecek yeni sunucu bulunamadı veya hepsi zaten ekli.");
            return prevServers;
          }

          return [...prevServers, ...newServers];
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      {isAuthenticated && (
        <div
          style={{
            width: 220,
            background: '#f8f9fa',
            borderRight: '1px solid #ddd',
            padding: '32px 16px 16px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            minHeight: '100vh',
            position: 'relative'
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16, color: '#333', textAlign: 'center' }}>
            👤 {authUsername}
          </div>
          <button
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              padding: '10px 0',
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: '500',
              marginBottom: 20
            }}
            onClick={handleLogout}
          >
            Çıkış Yap
          </button>
        </div>
      )}

      {/* Ana içerik */}
      <div style={{ flex: 1, padding: 32 }}>
        <AuthenticationModal
          isAuthenticated={isAuthenticated}
          authUsername={authUsername}
          setAuthUsername={setAuthUsername}
          authPassword={authPassword}
          setAuthPassword={setAuthPassword}
          authDomain={authDomain}
          setAuthDomain={setAuthDomain}
          authDcServer={authDcServer}
          setAuthDcServer={setAuthDcServer}
          authError={authError}
          attemptCount={attemptCount}
          isLocked={isLocked}
          handleInitialAuth={handleInitialAuth}
        />

        {isAuthenticated && (
          <ServerList
            servers={servers}
            setServers={setServers}
            selectedServers={selectedServers}
            showAdd={showAdd}
            setShowAdd={setShowAdd}
            newHost={newHost}
            setNewHost={setNewHost}
            handleAddServer={handleAddServer}
            editingIndex={editingIndex}
            setEditingIndex={setEditingIndex}
            editHost={editHost}
            setEditHost={setEditHost}
            handleEditServer={handleEditServer}
            handleSaveEdit={handleSaveEdit}
            handleCancelEdit={handleCancelEdit}
            handleRemoveServer={handleRemoveServer}
            handleToggleDMZ={handleToggleDMZ}
            handleTestConnection={handleTestConnection}
            handleScan={handleScan}
            handleBulkTestConnection={handleBulkTestConnection}
            handleBulkScan={handleBulkScan}
            handleBulkPatchUpdate={handleBulkPatchUpdate}
            handleSelectAll={handleSelectAll}
            handleServerSelect={handleServerSelect}
            connectionStatus={connectionStatus}
            errorLogs={errorLogs}
            showLogs={showLogs}
            setShowLogs={setShowLogs}
            hasErrors={hasErrors}
            handleFileUpload={handleFileUpload}
            fileInputRef={fileInputRef}
            onDmzLogin={handleOpenDmzLogin}
          />
        )}

        {selectedDmzServer && selectedDmzServer.isDMZ && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <DmzLogin
              serverName={selectedDmzServer.host}
              dmzUsername={selectedDmzServer.dmzUsername}
              dmzPassword={selectedDmzServer.dmzPassword}
              onSave={handleSaveDmzCredentials}
              onCancel={() => setSelectedDmzServer(null)}
            />
          </div>
        )}

        {isAuthenticated && (
          <div style={{ marginTop: 24 }}>
            <ErrorLogs
              showLogs={showLogs}
              hasErrors={hasErrors}
              errorLogs={errorLogs}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default WindowsPanelWrapper;
import React, { useEffect, useState } from 'react';
import LinuxCredentialsModal from './LinuxCredentialsModal';
import './LinuxCredentialsModal.css';

const BACKEND_URL = 'http://127.0.0.1:5000';

const LinuxPanelWrapper = () => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [credsModalOpen, setCredsModalOpen] = useState(false);
  const [credsMessage, setCredsMessage] = useState('');
  const [credsValid, setCredsValid] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    checkCredentials();
  }, []);

  const checkCredentials = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/linux/credentials/check`);
      const data = await res.json();
      setCredsValid(!!data?.valid);
      return !!data?.valid;
    } catch {
      setCredsValid(false);
      return false;
    }
  };

  const ensureCredsOrAsk = async (promptMsg) => {
    const valid = await checkCredentials();
    if (!valid) {
      setCredsMessage(promptMsg || 'Devam etmek için Linux kullanıcı adı ve şifre giriniz.');
      setCredsModalOpen(true);
      return false;
    }
    return true;
  };

  const handleSaveCredentials = async (username, password) => {
    const res = await fetch(`${BACKEND_URL}/linux/credentials/set`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!data?.success) throw new Error(data?.error || 'Kimlik bilgileri kaydedilemedi');
    setCredsValid(true);
  };

  const handleClearCredentials = async () => {
    await fetch(`${BACKEND_URL}/linux/credentials/clear`, { method: 'POST' });
    setCredsValid(false);
  };

  const handleBulkAddFromTxt = async () => {
    setError('');
    setBulkResult(null);

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setLoading(true);
        const text = await file.text();
        const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        const uniqueHosts = Array.from(new Set(lines));

        if (uniqueHosts.length === 0) {
          setError('Dosyada geçerli sunucu bulunamadı.');
          setLoading(false);
          return;
        }

        const existing = servers.map(s => s.host);
        const res = await fetch(`${BACKEND_URL}/linux/servers/bulkAdd`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hosts: uniqueHosts, existing })
        });
        const result = await res.json();

        if (!result?.success) {
          setError(result?.error || 'Toplu ekleme sırasında hata oluştu.');
        } else {
          setBulkResult({
            added: result.added || [],
            duplicates: result.duplicates || [],
            invalid: result.invalid || []
          });
          const merged = [...servers];
          (result.added || []).forEach(h => {
            if (!merged.find(s => s.host === h)) {
              merged.push({ host: h, status: 'new' });
            }
          });
          setServers(merged);
        }
      } catch (err) {
        setError(err.message || 'Toplu ekleme başarısız.');
      } finally {
        setLoading(false);
      }
    };
    input.click();
  };

  const handleTestConnection = async (host) => {
    setError('');
    const ok = await ensureCredsOrAsk('Bağlantı testi için Linux kimlik bilgisi gerekiyor.');
    if (!ok) return;

    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/linux/testConnection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host })
      });
      const data = await res.json();
      if (!data?.success) {
        throw new Error(data?.error || 'Bağlantı testi başarısız');
      }
      setServers(prev => prev.map(s => s.host === host ? { ...s, status: 'reachable' } : s));
    } catch (err) {
      setError(err.message);
      setServers(prev => prev.map(s => s.host === host ? { ...s, status: 'unreachable' } : s));
    } finally {
      setLoading(false);
    }
  };

  const handleRunPatch = async (selectedHosts) => {
    setError('');
    const ok = await ensureCredsOrAsk('Patch işlemi için Linux kimlik bilgisi gerekiyor.');
    if (!ok) return;

    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/linux/runPatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hosts: selectedHosts })
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || 'Patch işlemi başarısız');

      const map = new Map(data.results?.map(r => [r.host, r]) || []);
      setServers(prev => prev.map(s => {
        const r = map.get(s.host);
        return r ? { ...s, status: r.ok ? 'patched' : 'patch-failed' } : s;
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckReboot = async (host) => {
    setError('');
    const ok = await ensureCredsOrAsk('Reboot kontrolü için Linux kimlik bilgisi gerekiyor.');
    if (!ok) return;

    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/linux/reboot-status?host=${encodeURIComponent(host)}&username=root`);
      const data = await res.json();
      if (!data?.server) throw new Error('Reboot kontrolü başarısız');
      const rebootRequired = data.rebootStatus?.includes('REBOOT_REQUIRED');
      setServers(prev => prev.map(s => s.host === host ? { ...s, rebootRequired } : s));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="linux-panel">
      <div className="header">
        <h2>Linux Patch Paneli</h2>
        <div className="actions">
          <button onClick={handleBulkAddFromTxt} disabled={loading}>TXT'den Sunucu Ekle</button>
          <button onClick={() => setCredsModalOpen(true)} disabled={loading}>
            {credsValid ? 'Kimlik Bilgilerini Güncelle' : 'Kimlik Bilgisi Gir'}
          </button>
          {credsValid && (
            <button onClick={handleClearCredentials} disabled={loading}>Kimlik Bilgilerini Sil</button>
          )}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {bulkResult && (
        <div className="bulk-result">
          <div><strong>Eklendi:</strong> {(bulkResult.added || []).join(', ') || '-'}</div>
          <div><strong>Tekrarlar:</strong> {(bulkResult.duplicates || []).join(', ') || '-'}</div>
          <div><strong>Geçersiz:</strong> {(bulkResult.invalid || []).join(', ') || '-'}</div>
        </div>
      )}

      <table className="server-table">
        <thead>
          <tr>
            <th>Host</th>
            <th>Durum</th>
            <th>Reboot</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {servers.map((s) => (
            <tr key={s.host}>
              <td>{s.host}</td>
              <td>{s.status || '-'}</td>
              <td>{s.rebootRequired ? 'Gerekli' : (s.rebootRequired === false ? 'Gerekmez' : '-')}</td>
              <td className="row-actions">
                <button onClick={() => handleTestConnection(s.host)} disabled={loading}>Test</button>
                <button onClick={() => handleCheckReboot(s.host)} disabled={loading}>Reboot Check</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {servers.length > 0 && (
        <div className="footer-actions">
          <button 
            onClick={() => handleRunPatch(servers.map(s => s.host))} 
            disabled={loading}
          >
            Tümüne Patch Ata
          </button>
        </div>
      )}

      <LinuxCredentialsModal
        isOpen={credsModalOpen}
        onClose={() => setCredsModalOpen(false)}
        onSubmit={handleSaveCredentials}
        message={credsMessage}
      />
    </div>
  );
};

export default LinuxPanelWrapper;
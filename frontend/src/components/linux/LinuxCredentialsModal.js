import React, { useState } from 'react';
import './LinuxCredentialsModal.css';

const LinuxCredentialsModal = ({ isOpen, onClose, onSubmit, message }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Kullanıcı adı ve şifre gereklidir');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(username, password);
      // Başarılı olursa formu temizle
      setUsername('');
      setPassword('');
      onClose();
    } catch (err) {
      setError(err.message || 'Kimlik bilgileri kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername('');
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="linux-creds-modal-overlay">
      <div className="linux-creds-modal">
        <div className="linux-creds-modal-header">
          <h3>Linux Kimlik Bilgileri</h3>
          <button className="close-btn" onClick={handleCancel}>×</button>
        </div>
        
        <div className="linux-creds-modal-body">
          {message && <p className="info-message">{message}</p>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="linux-username">Kullanıcı Adı:</label>
              <input
                type="text"
                id="linux-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="root veya sudo yetkili kullanıcı"
                autoComplete="off"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="linux-password">Şifre:</label>
              <input
                type="password"
                id="linux-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="off"
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="info-box">
              <strong>Güvenlik Notu:</strong> Kimlik bilgileriniz sadece bu oturum için 
              RAM'de tutulur ve 15 dakika sonra otomatik silinir. Hiçbir yere kaydedilmez.
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={handleCancel}
                disabled={loading}
              >
                İptal
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet ve Devam Et'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LinuxCredentialsModal;
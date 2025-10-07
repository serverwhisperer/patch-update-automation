const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  runSSH: (server, command) => ipcRenderer.invoke('ssh-command', server, command),
  detectOS: (server) => ipcRenderer.invoke('detect-os', server),
  runUpdate: (server, updateType, osType) => ipcRenderer.invoke('run-update', server, updateType, osType),
  checkReboot: (server, osType) => ipcRenderer.invoke('check-reboot', server, osType),  // ✅ YENİ
  openWindow: (route, options) => ipcRenderer.invoke('open-window', route, options)
});
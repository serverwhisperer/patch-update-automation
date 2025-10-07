const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fetch = require('node-fetch'); // npm install node-fetch@2 (v2 CommonJS için)

let mainWindow;

// FastAPI backend URL
const BACKEND_URL = 'http://127.0.0.1:5000';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('index.html');
  
  // Development için DevTools
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ------------- HELPER: FastAPI çağrısı -------------
async function callBackend(endpoint, method = 'GET', body = null) {
  const url = `${BACKEND_URL}${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ------------- LINUX CREDENTIAL IPC HANDLERS -------------
ipcMain.handle('linux:set-credentials', async (event, { username, password }) => {
  return await callBackend('/linux/credentials/set', 'POST', { username, password });
});

ipcMain.handle('linux:check-credentials', async () => {
  return await callBackend('/linux/credentials/check', 'GET');
});

ipcMain.handle('linux:clear-credentials', async () => {
  return await callBackend('/linux/credentials/clear', 'POST');
});

// ------------- LINUX BULK ADD -------------
ipcMain.handle('linux:bulk-add-servers', async (event, { fileContent, existing }) => {
  // fileContent: renderer'dan gelen host dizisi
  // existing: mevcut envanterdeki hostlar (opsiyonel)
  return await callBackend('/linux/servers/bulkAdd', 'POST', { hosts: fileContent, existing: existing || [] });
});

// ------------- LINUX TEST CONNECTION -------------
ipcMain.handle('linux:test-connection', async (event, { host }) => {
  return await callBackend('/linux/testConnection', 'POST', { host });
});

// ------------- LINUX RUN PATCH -------------
ipcMain.handle('linux:run-patch', async (event, { hosts }) => {
  return await callBackend('/linux/runPatch', 'POST', { hosts });
});

// ------------- LINUX REBOOT CHECK -------------
ipcMain.handle('linux:check-reboot', async (event, { host, username }) => {
  const query = `?host=${encodeURIComponent(host)}&username=${encodeURIComponent(username || 'root')}`;
  return await callBackend(`/linux/reboot-status${query}`, 'GET');
});

// ------------- WINDOWS AUTH (mevcut) -------------
ipcMain.handle('windows:authenticate', async (event, { username, password, domain, dc_server }) => {
  const query = `?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&domain=${encodeURIComponent(domain)}&dc_server=${encodeURIComponent(dc_server)}`;
  return await callBackend(`/authenticate${query}`, 'GET');
});

// ------------- WINDOWS TEST CONNECTION (mevcut) -------------
ipcMain.handle('windows:test-connection', async (event, { host, username, password }) => {
  const query = `?host=${encodeURIComponent(host)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
  return await callBackend(`/test-connection${query}`, 'GET');
});
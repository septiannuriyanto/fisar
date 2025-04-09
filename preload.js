const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  toggleBot: (status) => ipcRenderer.send('toggle-bot', status),
  onLog: (callback) => ipcRenderer.on('bot-log', (event, data) => callback(data))
});

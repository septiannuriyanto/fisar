const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  toggleBot: (status) => ipcRenderer.send('toggle-bot', status),
  downloadSoh: () => ipcRenderer.send('download-soh'), // ✅ harus ada ini
  downloadPo: () => ipcRenderer.send('download-po'), // ✅ harus ada ini
  checkSummaryPo: () => ipcRenderer.send('checksummary-po'), // ✅ harus ada ini
  sendTestMessage: () => ipcRenderer.send('send-testmessage'), // ✅ harus ada ini
  onLog: (callback) => ipcRenderer.on('bot-log', (event, data) => callback(data))
});
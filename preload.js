const {ipcRenderer, contextBridge} = require('electron');

contextBridge.exposeInMainWorld('file_find', {
  openDialog() {
    ipcRenderer.send('openDialog');
  },

  runShell(items) {
    ipcRenderer.send('runShell', {value: items});
  }
});
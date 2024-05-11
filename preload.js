const {ipcRenderer, contextBridge} = require('electron');
const base_path = process.env.INIT_CWD
const ref_path = base_path + '/ref/'
const result_path = base_path + '/result/'

contextBridge.exposeInMainWorld('file_find', {
  openDialog() {
    ipcRenderer.send('openDialog');
  },

  runShell(items) {
    ipcRenderer.send('runShell', {value: items});
  },

  runShell2(obj) {
    ipcRenderer.send('runShell2', {value: obj});
  },

  auspice() {
    ipcRenderer.send('auspice');
  },

  openBase() {
    ipcRenderer.send('baseOpen');
  }
});
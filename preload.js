const {ipcRenderer, contextBridge, shell} = require('electron');
const base_path = process.env.INIT_CWD
const ref_path = base_path + '/ref/'
const result_path = base_path + '/result/'
const log = require('electron-log')

contextBridge.exposeInMainWorld('file_find', {
  openDialog() {
    ipcRenderer.send('openDialog');
  },

  runShell(items) {
    ipcRenderer.send('runShell', {value: items});
  },

  openBase() {
    log.info("test")
    log.info(base_path)
    shell.openPath(base_path) 
  }
});
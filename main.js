const {app, BrowserWindow, dialog, ipcMain, shell} = require('electron');
const { Worker } = require('worker_threads');
const path = require('path');
const log = require('electron-log')
const appPath = app.isPackaged ? process.execPath.replace('/'+app.getName(),'') : app.getAppPath();
log.info(process.execPath)
log.info(app.getAppPath())


const base_path = appPath
log.info(base_path)

const ref_path = base_path + '/ref'
const result_path = base_path + '/result'

log.info(ref_path)

const fs = require('fs');
if (!fs.existsSync(ref_path)) fs.mkdir(ref_path, (error) => error && log.info(error));
if (!fs.existsSync(result_path)) fs.mkdir(result_path, (error) => error && log.info(error));
const refs = fs.readdirSync(ref_path)
log.info(refs)

app.commandLine.appendSwitch("disable-software-rasterizer");
app.commandLine.appendSwitch('disable-gpu');


app.whenReady().then(() => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      autoHideMenuBar: true
    }
  });
  win.setSize(1200, 850)
  win.loadFile('main.html');
  const myWorker = new Worker(path.join(__dirname, 'worker.js'));
  const q_list = []
  

  function ref_init() {
    for ( let ref in refs ) {
      let ref_dir = ref_path + '/' + refs[ref]
      //log.info(ref_dir)
      files = fs.readdirSync(ref_dir)
      ref_files = []
      for ( ref_file in files ) {
        ref_files.push('"'+files[ref_file]+'"')
      }

      //log.info(ref_files)
      log.info(refs[ref] + '",[' + ref_files +'])')
      log.info(ref_files.length)
      log.info('refAdd("' + refs[ref] + '",[' + ref_files +'])')
      win.webContents.executeJavaScript('refAdd("' + refs[ref] + '",[' + ref_files +'])')
    }
  }

  ref_init()

  ipcMain.on('openDialog', () => {
    dialog.showOpenDialog({defaultPath: base_path, properties: ['openFile', 'multiSelections'], filters: [{ name: 'fastq', extensions: ['fastq']} ] }).then((obj) => {
      log.info(obj.filePaths)
      if ( obj.filePaths.length > 0 ){
        for ( let index in obj.filePaths){
          let item = obj.filePaths[index]
          log.info(item)
          win.webContents.executeJavaScript('additems("'+item+'")')
        }
      }
    })
  });

  ipcMain.on('baseOpen', () => {
    log.info('baseOpen')
    shell.openPath(base_path)
  })
  
  ipcMain.on('runShell', (event, items) => {
    log.info('아이템: ',items)
    if ( items.value.length > 0 ){
      for ( let item in items.value ) {
        q_list.push(item)
      }

      win.webContents.executeJavaScript('progress_result("'+q_list.length+'")')
      
      win.webContents.executeJavaScript('elementDisabled(true)')
      //win.webContents.executeJavaScript('document.querySelector("div.loading-container").style.display = "block"')  
      myWorker.on('message', (result) => {
        log.info('test: ' ,result)
        log.info('q_list:',q_list)
        log.info('q_list.length:',q_list.length)
        itemId = result["itemId"]
        value = result["value"]
        win.webContents.executeJavaScript('setStatus("'+itemId+'","[ 완료 ] ")')
        q_list.pop(result)
        win.webContents.executeJavaScript('progress_add()')
        if ( q_list.length == 0 ){
          win.webContents.executeJavaScript('elementDisabled(false)')
          win.webContents.executeJavaScript('alert("Complete")')
          //win.webContents.executeJavaScript('document.querySelector("div.loading-container").style.display = "none"')  
        }
      });
      myWorker.postMessage(items);
    }
  })
});


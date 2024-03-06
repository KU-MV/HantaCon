const {app, BrowserWindow, dialog, ipcMain, shell} = require('electron');
const { Worker } = require('worker_threads');
const path = require('path');
const log = require('electron-log')
const appPath = app.isPackaged ? process.execPath.replace('/'+app.getName(),'') : app.getAppPath();
//log.info(process.execPath)
//log.info(app.getAppPath())

log.info(app.getPath('userData'))
log.info(app.getPath('home'))
log.info(app.getPath('desktop'))

const data_path = app.getPath('home') + '/Hantacon'
const nextstrain_L_path = data_path + '/nextstrain/htv_L'
const nextstrain_M_path = data_path + '/nextstrain/htv_M'
const nextstrain_S_path = data_path + '/nextstrain/htv_S'
const nextstrain_L_auspice = nextstrain_L_path + '/auspice/htv_L.json'
const nextstrain_M_auspice = nextstrain_M_path + '/auspice/htv_M.json'
const nextstrain_S_auspice = nextstrain_S_path + '/auspice/htv_S.json'


const base_path = appPath
log.info(base_path)

const ref_path = base_path + '/ref'
const result_path = data_path + '/result'
const auspice_result_path = data_path + '/auspice_result'


log.info(ref_path)

const fs = require('fs');
if (!fs.existsSync(data_path)) fs.mkdir(data_path, (error) => error && log.info(error));
if (!fs.existsSync(ref_path)) fs.mkdir(ref_path, (error) => error && log.info(error));
if (!fs.existsSync(result_path)) fs.mkdir(result_path, (error) => error && log.info(error));
if (!fs.existsSync(auspice_result_path)) fs.mkdir(auspice_result_path, (error) => error && log.info(error));
const refs = fs.readdirSync(ref_path)
log.info(refs)

app.commandLine.appendSwitch("disable-software-rasterizer");
app.commandLine.appendSwitch('disable-gpu');


function file_write(file_path, content, new_file=false){
  try {
    if ((fs.existsSync(file_path)) && (new_file==false)){
      fs.appendFileSync(file_path, content, 'utf-8');
    } else {
      fs.writeFileSync(file_path, content, 'utf-8');
    }
  } catch (err) {
    log.info(err)
    log.info('write error: ', file_path)
  }

}

function file_write2(file_path, content, new_file=false){
  if ((fs.existsSync(file_path)) && (new_file==false)){
    fs.appendFile(file_path, content, 'utf-8', (err) => {log.info(err)});
    log.info('add')
  } else {
    fs.writeFile(file_path, content, 'utf-8', (err) => {log.info(err)});
    log.info('create')
  }
}

function file_read(file_path, read_type='text'){

  try {
    data = fs.readFileSync(file_path, 'utf-8')

    if (read_type == "json") {
      data = JSON.parse(data)
    }

    return data
  
  } catch (err) {
    log.info(err)
    log.info('read error: ', file_path)
  }
}

function read_consensus(file_path){
  read_data = file_read(file_path)
  let data_split = String(read_data).split('\n')

  text = ""
  for ( line_index in data_split ) {
    if (line_index > 0) {
      text += data_split[line_index]
    }
  }

  return text
}

//icon_path = path.join(__dirname, '/img/icons/icon.png')

app.whenReady().then(() => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      //icon: icon_path
    },
    autoHideMenuBar: true
  });

  //if (process.platform === "linux") {
  //  win.icon = icon_path;
  //}

  win.setSize(1200, 980)
  win.loadFile('main.html');
  const myWorker = new Worker(path.join(__dirname, 'worker.js'));
  const myWorker2 = new Worker(path.join(__dirname, 'worker2.js'));
  const q_list = []
  win.webContents.executeJavaScript('document.querySelector("div.config input#basePath").value = "' + base_path +'"') 
  win.webContents.executeJavaScript('document.querySelector("div.config input#dataPath").value = "' + data_path +'"') 

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
  if (!fs.existsSync(data_path+'/main.nf')) fs.copyFile(base_path+'/main.nf', data_path+'/main.nf',(error) => error && log.info(error));
  if (!fs.existsSync(data_path+'/nextflow.config')) fs.copyFile(base_path+'/nextflow.config', data_path+'/nextflow.config',(error) => error && log.info(error));
  if (!fs.existsSync(data_path+'/consensus.nf')) fs.copyFile(base_path+'/consensus.nf', data_path+'/consensus.nf',(error) => error && log.info(error));


  ipcMain.on('openDialog', () => {
    dialog.showOpenDialog({defaultPath: data_path, properties: ['openFile', 'multiSelections'], filters: [{ name: 'fastq', extensions: ['fastq']} ] }).then((obj) => {
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
    shell.openPath(data_path)
  })

  ipcMain.on('auspice', () => {
    log.info('auspice')
    win.webContents.executeJavaScript('elementDisabled(true)')
    workdirs = [nextstrain_L_path, nextstrain_M_path, nextstrain_S_path]
    nextstrain_works = []
    for (workdir_index in workdirs) {
      run_obj = {
        'app': 'nextstrain',
        'args': ['shell','.','-c','snakemake -c1'],
        'workdir': workdirs[workdir_index]
      }
      nextstrain_works.push(run_obj)
      log.info('run_obj: ',run_obj)
      folderPath_result = workdirs[workdir_index]+"/results"
      folderPath_auspice = workdirs[workdir_index]+"/auspice"
      log.info("folderPath_result: ",folderPath_result)
      log.info("folderPath_auspice: ",folderPath_auspice)
      if (fs.existsSync(folderPath_result)) {
        fs.rmSync(folderPath_result, { recursive: true });
      }
      if (fs.existsSync(folderPath_auspice)) {
        fs.rmSync(folderPath_auspice, { recursive: true });
      }
    }


    myWorker2.postMessage(nextstrain_works)
    myWorker2.on('message', (nextstrain_result) => {
      //nextstrain shell . -c "snakemake -c1"
      log.info('stdin: ', nextstrain_result['result'].stdin)
      log.info('stdout: ', nextstrain_result['result'].stdout)
      log.info('stderr: ', nextstrain_result['result'].stderr)
      nextstrain_works.pop(nextstrain_result['item'])
      if ( nextstrain_works.length == 0 ){
        win.webContents.executeJavaScript('elementDisabled(false)')
        win.webContents.executeJavaScript('alert("Complete")')
        let currentDate = new Date();
        let formattedDate = auspice_result_path + '/' + currentDate.toISOString().replace(/T/,'_').replace(/\..+/, '').replace('-','_').replace('-','_').replace(':','_').replace(':','_');
        fs.mkdirSync(formattedDate)
        if (fs.existsSync(nextstrain_L_auspice)) fs.copyFile(nextstrain_L_auspice, formattedDate+'/htv_L.json',(error) => error && log.info(error));
        if (fs.existsSync(nextstrain_M_auspice)) fs.copyFile(nextstrain_M_auspice, formattedDate+'/htv_M.json',(error) => error && log.info(error));
        if (fs.existsSync(nextstrain_S_auspice)) fs.copyFile(nextstrain_S_auspice, formattedDate+'/htv_S.json',(error) => error && log.info(error));
      }
    })
    log.info('end')
  })

  ipcMain.on('runShell', (event, items) => {

    let nextstrain_chk = false
    log.info('아이템: ',items)
    if ( items.value.length > 0 ){
      for ( let item in items.value ) {
        q_list.push(item)
      }

      win.webContents.executeJavaScript('progress_result("'+q_list.length+'")')
      
      win.webContents.executeJavaScript('elementDisabled(true)')
      //win.webContents.executeJavaScript('document.querySelector("div.loading-container").style.display = "block"')  
      myWorker.on('message', (obj) => {
        let result_name = obj['name']
        let result = obj['result']
        let item = obj['item']
        let app = obj['app']
        let args = obj['args']
        let bams = obj['bams']
        let bams_L = bams['L']
        let bams_M = bams['M']
        let bams_S = bams['S']
        let consensus = obj['consensus']
        let consensus_L = consensus['L']
        let consensus_M = consensus['M']
        let consensus_S = consensus['S']
        let nextstrain_run = obj['nextstrain']
        let metadata = obj['metadata']['data']
        let metadata_L = obj['metadata']['L']
        let metadata_M = obj['metadata']['M']
        let metadata_S = obj['metadata']['S']
        let sequence_L = obj['sequence']['L']
        let sequence_M = obj['sequence']['M']
        let sequence_S = obj['sequence']['S']
        

        //log.info('test: ' ,item)
        //log.info('q_list:',q_list)
        //log.info('q_list.length:',q_list.length)
        log.info('app: ', app)
        log.info('args: ', args)
        cmd = app
        for ( let arg in args ) {
          cmd += " " + args[arg]
        }
        log.info('cmd: ', cmd)
        //win.webContents.executeJavaScript('alert("'+cmd+'")')1
        log.info('stdin: ', result.stdin)
        //win.webContents.executeJavaScript('alert("'+result.stdin+'")')
        log.info('stdout: ', result.stdout)
        //win.webContents.executeJavaScript('alert("'+result.stdout+'")')
        log.info('stderr: ', result.stderr)
        //win.webContents.executeJavaScript('alert("'+result.stderr+'")')
        nextstrain_chk = nextstrain_run
        if (nextstrain_run==true){
          if (fs.existsSync(consensus_L)) {
            let consensus_data = read_consensus(consensus_L)
            let input_text = ">" + result_name + "\n" + consensus_data + "\n"
            log.info(input_text)
            log.info(metadata)
            file_write(file_path=sequence_L, content=input_text)
            file_write(file_path=metadata_L, content=metadata)
          }
  
          if (fs.existsSync(consensus_M)) {
            let consensus_data = read_consensus(consensus_M)
            let input_text = ">" + result_name + "\n" + consensus_data + "\n"
            log.info(input_text)
            log.info(metadata)
            file_write(file_path=sequence_M, content=input_text)
            file_write(file_path=metadata_M, content=metadata)
          }
  
          if (fs.existsSync(consensus_S)) {
            let consensus_data = read_consensus(consensus_S)
            let input_text = ">" + result_name + "\n" + consensus_data + "\n"
            log.info(input_text)
            log.info(metadata)
            file_write(file_path=sequence_S, content=input_text)
            file_write(file_path=metadata_S, content=metadata)
          }
        }

      
        itemId = item["itemId"]
        value = item["value"]
        if ((fs.existsSync(bams_L)) && (fs.existsSync(bams_M)) && (fs.existsSync(bams_S))){
          win.webContents.executeJavaScript('setStatus("'+itemId+'","[ 완료 ] ")')
          
        } else {
          win.webContents.executeJavaScript('setStatus("'+itemId+'","[ 실패 ] ")')
        }

        q_list.pop(item)
        win.webContents.executeJavaScript('progress_add()')
        if ( q_list.length == 0 ){
          
          if ( nextstrain_chk == true ) {
            workdirs = [nextstrain_L_path, nextstrain_M_path, nextstrain_S_path]
            nextstrain_works = []
            for (workdir_index in workdirs) {
              run_obj = {
                'app': 'nextstrain',
                'args': ['shell','.','-c','snakemake -c1'],
                'workdir': workdirs[workdir_index]
              }
              nextstrain_works.push(run_obj)
              log.info('run_obj: ',run_obj)
              folderPath_result = workdirs[workdir_index]+"/results"
              folderPath_auspice = workdirs[workdir_index]+"/auspice"
              log.info("folderPath_result: ",folderPath_result)
              log.info("folderPath_auspice: ",folderPath_auspice)
              if (fs.existsSync(folderPath_result)) {
                fs.rmSync(folderPath_result, { recursive: true });
              }
              if (fs.existsSync(folderPath_auspice)) {
                fs.rmSync(folderPath_auspice, { recursive: true });
              }
            }
        

            myWorker2.postMessage(nextstrain_works)
            myWorker2.on('message', (nextstrain_result) => {
              //nextstrain shell . -c "snakemake -c1"
              log.info('stdin: ', nextstrain_result['result'].stdin)
              log.info('stdout: ', nextstrain_result['result'].stdout)
              log.info('stderr: ', nextstrain_result['result'].stderr)
              nextstrain_works.pop(nextstrain_result['item'])
              if ( nextstrain_works.length == 0 ){
                win.webContents.executeJavaScript('elementDisabled(false)')
                win.webContents.executeJavaScript('alert("Complete")')
                let currentDate = new Date();
                let formattedDate = auspice_result_path + '/' + currentDate.toISOString().replace(/T/,'_').replace(/\..+/, '').replace('-','_').replace('-','_').replace(':','_').replace(':','_');
                fs.mkdirSync(formattedDate)
                if (fs.existsSync(nextstrain_L_auspice)) fs.copyFile(nextstrain_L_auspice, formattedDate+'/htv_L.json',(error) => error && log.info(error));
                if (fs.existsSync(nextstrain_M_auspice)) fs.copyFile(nextstrain_M_auspice, formattedDate+'/htv_M.json',(error) => error && log.info(error));
                if (fs.existsSync(nextstrain_S_auspice)) fs.copyFile(nextstrain_S_auspice, formattedDate+'/htv_S.json',(error) => error && log.info(error));
              }
            })
            log.info('end')
          } else {
            win.webContents.executeJavaScript('elementDisabled(false)')
            win.webContents.executeJavaScript('alert("Complete")')
          }
        }
      });

      myWorker.postMessage(items);
    }
  })
});


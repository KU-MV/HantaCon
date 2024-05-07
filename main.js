const {app, BrowserWindow, dialog, ipcMain, shell} = require('electron');
const { Worker } = require('worker_threads');
const path = require('path');
const log = require('electron-log')
const appPath = app.isPackaged ? process.execPath.replace('/'+app.getName(),'') : app.getAppPath();
const fs = require('fs');
const unzipper = require('unzipper');

//log.info(process.execPath)
//log.info(app.getAppPath())
app.commandLine.appendSwitch("disable-software-rasterizer");
app.commandLine.appendSwitch('disable-gpu');



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

try {
  log.info(app.getPath('home'))
  log.info(appPath)

  const data_path = app.getPath('home') + '/hantacon'
  const config_path = data_path + '/config.json'
  if (!fs.existsSync(data_path)) fs.mkdirSync(data_path);
  if (!fs.existsSync(config_path)) fs.copyFileSync(appPath+'/config.json', config_path, mode=fs.constants.COPYFILE_EXCL);
  config = file_read(config_path, read_type='json')
  log.info(config)

  //const nextstrain_L_path = config['path']['nextstrain']['htv_L'].replace("{basePath}",data_path)//data_path + '/nextstrain/htv_L'
  //const nextstrain_M_path = config['path']['nextstrain']['htv_M'].replace("{basePath}",data_path)//data_path + '/nextstrain/htv_M'
  //const nextstrain_S_path = config['path']['nextstrain']['htv_S'].replace("{basePath}",data_path)//data_path + '/nextstrain/htv_S'
  //const nextstrain_L_auspice = config['path']['auspice']['htv_L'].replace("{basePath}",data_path)//nextstrain_L_path + '/auspice/htv_L.json'
  //const nextstrain_M_auspice = config['path']['auspice']['htv_M'].replace("{basePath}",data_path)//nextstrain_M_path + '/auspice/htv_M.json'
  //const nextstrain_S_auspice = config['path']['auspice']['htv_S'].replace("{basePath}",data_path)//nextstrain_S_path + '/auspice/htv_S.json'
  const ref_path = config['path']['ref'].replace("{basePath}",data_path)//base_path + '/ref'
  const result_path = config['path']['result'].replace("{basePath}",data_path)//data_path + '/result'
  const auspice_result_path = config['path']['auspice_result'].replace("{basePath}",data_path)//data_path + '/auspice_result'

  const ref1 = ref_path + '/HTNV_76-118'
  const ref1_L = '/HTNV_76-118/HTNV_76-118_L.fasta'
  const ref1_M = '/HTNV_76-118/HTNV_76-118_M.fasta'
  const ref1_S = '/HTNV_76-118/HTNV_76-118_S.fasta'
  
  const ref2 = ref_path + '/SEOV'
  const ref2_L = '/SEOV/SEOV_80-39_L.fasta'
  const ref2_M = '/SEOV/SEOV_80-39_M.fasta'
  const ref2_S = '/SEOV/SEOV_80-39_S.fasta'

  if (!fs.existsSync(ref_path)) fs.mkdirSync(ref_path);
  if (!fs.existsSync(ref1)) fs.mkdirSync(ref1);
  if (!fs.existsSync(ref_path+ref1_L)) fs.copyFileSync(appPath+'/ref'+ref1_L, ref_path+ref1_L, mode=fs.constants.COPYFILE_EXCL);
  if (!fs.existsSync(ref_path+ref1_M)) fs.copyFileSync(appPath+'/ref'+ref1_M, ref_path+ref1_M, mode=fs.constants.COPYFILE_EXCL);
  if (!fs.existsSync(ref_path+ref1_S)) fs.copyFileSync(appPath+'/ref'+ref1_S, ref_path+ref1_S, mode=fs.constants.COPYFILE_EXCL);

  if (!fs.existsSync(ref2)) fs.mkdirSync(ref2);
  if (!fs.existsSync(ref_path+ref2_L)) fs.copyFileSync(appPath+'/ref'+ref2_L, ref_path+ref2_L, mode=fs.constants.COPYFILE_EXCL);
  if (!fs.existsSync(ref_path+ref2_M)) fs.copyFileSync(appPath+'/ref'+ref2_M, ref_path+ref2_M, mode=fs.constants.COPYFILE_EXCL);
  if (!fs.existsSync(ref_path+ref2_S)) fs.copyFileSync(appPath+'/ref'+ref2_S, ref_path+ref2_S, mode=fs.constants.COPYFILE_EXCL);

  if (!fs.existsSync(result_path)) fs.mkdirSync(result_path);
  if (!fs.existsSync(auspice_result_path)) fs.mkdirSync(auspice_result_path);
  if (!fs.existsSync(data_path+'/main.nf')) fs.copyFileSync(appPath+'/main.nf', data_path+'/main.nf', mode=fs.constants.COPYFILE_EXCL);
  if (!fs.existsSync(data_path+'/nextflow.config')) fs.copyFileSync(appPath+'/nextflow.config', data_path+'/nextflow.config', mode=fs.constants.COPYFILE_EXCL);
  if (!fs.existsSync(data_path+'/consensus.nf')) fs.copyFileSync(appPath+'/consensus.nf', data_path+'/consensus.nf', mode=fs.constants.COPYFILE_EXCL);
  
  function unzip(zipFilePath, extractDir){
    fs.createReadStream(zipFilePath)
    .pipe(unzipper.Parse())
    .on('entry', entry => {
        const fileName = entry.path;
        const type = entry.type; // 'Directory' or 'File'
        const destination = `${extractDir}/${fileName}`;
  
        // 파일 덮어쓰기
        if (type === 'File') {
            entry.pipe(fs.createWriteStream(destination, { overwrite: true }));
        } else if (type === 'Directory') {
            fs.mkdirSync(destination, { recursive: true });
        }
    })
    .promise()
    .then(() => {
        console.log('ZIP 파일 추출 완료');
    })
    .catch(err => {
        console.error('ZIP 파일 추출 중 오류 발생:', err);
    });
  }

  const zipFilePath = appPath + '/nextstrain.zip'
  const nextstrain_path = data_path + '/nextstrain'

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
    //win.webContents.executeJavaScript('document.querySelector("div.config input#basePath").value = "' + base_path +'"') 
    win.webContents.executeJavaScript('document.querySelector("div.config input#dataPath").value = "' + data_path +'"') 
    
    function ref_init() {    
      const refs = fs.readdirSync(ref_path)
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
      unzip(zipFilePath, data_path)
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
        post_obj = {
          "items": items,
          "config": config
        }
        myWorker.postMessage(post_obj);
      }
    })
  });

} catch (err) {
  log.info(err)
  app.exit()
}




//cat ./ref/HTNV_76-118/HTNV_76-118_L.fasta ./ref/HTNV_76-118/HTNV_76-118_M.fasta ./ref/HTNV_76-118/HTNV_76-118_S.fasta
//conda run nextflow run "/home/grey/hantacon/main.nf" --fastq /home/grey/hantacon/HTNV_Aa19-36.fastq --prefix HTNV_Aa19-36 --outdir /home/grey/hantacon/result/HTNV_Aa19-36 --L ./ref/HTNV_76-118/HTNV_76-118_L.fasta --M ./ref/HTNV_76-118/HTNV_76-118_M.fasta --S ./ref/HTNV_76-118/HTNV_76-118_S.fasta --low-cov-threshold 10

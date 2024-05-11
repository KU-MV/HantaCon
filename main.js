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
  log.info(file_path)
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
      text += data_split[line_index] + '\n'
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
  //const auspice_result_path = config['path']['auspice_result'].replace("{basePath}",data_path)//data_path + '/auspice_result'

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
  //if (!fs.existsSync(auspice_result_path)) fs.mkdirSync(auspice_result_path);
  if (!fs.existsSync(data_path+'/main.nf')) fs.copyFileSync(appPath+'/main.nf', data_path+'/main.nf', mode=fs.constants.COPYFILE_EXCL);
  if (!fs.existsSync(data_path+'/nextflow.config')) fs.copyFileSync(appPath+'/nextflow.config', data_path+'/nextflow.config', mode=fs.constants.COPYFILE_EXCL);
  if (!fs.existsSync(data_path+'/consensus.nf')) fs.copyFileSync(appPath+'/consensus.nf', data_path+'/consensus.nf', mode=fs.constants.COPYFILE_EXCL);
  if (!fs.existsSync(data_path+'/nextstrain.nf')) fs.copyFileSync(appPath+'/nextstrain.nf', data_path+'/nextstrain.nf', mode=fs.constants.COPYFILE_EXCL);
  
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

  function removeDirectory(directoryPath) {
    // Check if directory exists
    if (fs.existsSync(directoryPath)) {
        // Remove directory
        fs.rmdirSync(directoryPath, { recursive: true }, (err) => {
            if (err) {
                // Handle error
                log.info('Error', err.message);
                //dialog.showErrorBox('Error', err.message);
                return;
            }
            log.info('Directory removed successfully');
        });
    } else {
      log.info('Directory does not exist');
    }
  }


  const zipFilePath = appPath + '/nextstrain.zip'
  const nextstrain_path = data_path + '/nextstrain'
  const nextstrain_L_path = data_path + '/nextstrain/htv_L'
  const nextstrain_M_path = data_path + '/nextstrain/htv_M'
  const nextstrain_S_path = data_path + '/nextstrain/htv_S'

  if (!fs.existsSync(nextstrain_path)) unzip(zipFilePath, data_path);

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
  
    ipcMain.on('openDialog2', () => {
      dialog.showOpenDialog({defaultPath: data_path + '/result', properties: ['openFile'], filters: [{ name: 'fasta', extensions: ['fasta']} ] }).then((obj) => {
        log.info(obj)
        log.info(obj.filePaths)
        if ( obj.filePaths.length > 0 ){
          let item = obj.filePaths[0]
          log.info(item)
          win.webContents.executeJavaScript('fileselect("'+item+'")')
        }
      })
    });

    ipcMain.on('baseOpen', () => {
      log.info('baseOpen')
      shell.openPath(data_path)
    })
    
    ipcMain.on('runShell2', (event, obj) => {
      log.info(obj)
      strain_type = obj['strain_type']
      file_path = obj['file_path']
      reset = obj['reset']


      strain = obj['strain']
      host = ''
      gec = ''
      lineage = ''
      hz = ''
      accession = ''
      date = obj['date']
      country = obj['country']
      province = obj['province']
      city = obj['city']
      town = obj['town']
      db = ''
      title = ''
      journal = ''
      paper_url = ''
    
      
      if ( strain_type = "L" ) {
        sequence_path = nextstrain_L_path + "/data/sequence.fasta"
        metadata_path = nextstrain_L_path + "/data/metadata.tsv"
        workdir = nextstrain_L_path
      } else if ( strain_type = "M" ) {
        sequence_path = nextstrain_M_path + "/data/sequence.fasta"
        metadata_path = nextstrain_M_path + "/data/metadata.tsv"
        workdir = nextstrain_M_path

      } else if ( strain_type = "S" ) {
        sequence_path = nextstrain_S_path + "/data/sequence.fasta"
        metadata_path = nextstrain_S_path + "/data/metadata.tsv"
        workdir = nextstrain_S_path
      }

      if ( reset === "Yes" ) {
        removeDirectory(nextstrain_path)
        unzip(zipFilePath, data_path)
      } else {
        folderPath_result = workdir+"/results"
        folderPath_auspice = workdir+"/auspice"
        if (fs.existsSync(folderPath_result)) {
            fs.rmSync(folderPath_result, { recursive: true });
        }
        if (fs.existsSync(folderPath_auspice)) {
            fs.rmSync(folderPath_auspice, { recursive: true });
          }
      }

      let consensus_data = read_consensus(file_path)
      let input_text = ">" + strain + "\n" + consensus_data + "\n"

      let metadata_text = '\n' + strain + "\t"
      metadata_text += host + "\t"
      metadata_text += gec + "\t"
      metadata_text += lineage + "\t"
      metadata_text += hz + "\t"
      metadata_text += accession + "\t"
      metadata_text += date + "\t"
      metadata_text += province + "\t"
      metadata_text += country + "\t"
      metadata_text += city + "\t"
      metadata_text += town + "\t"
      metadata_text += db + "\t"
      metadata_text += title + "\t"
      metadata_text += journal + "\t"
      metadata_text += paper_url + "\n"

      log.info(metadata_text)
      file_write(file_path=sequence_path, content=input_text)
      file_write(file_path=metadata_path, content=metadata_text)

      run_obj = [
        {
          'app': 'micromamba',
          'args': ['run','-n',config['app']['env_name'], 'nextflow', data_path+'/nextstrain.nf','--basepath', workdir],
          'workdir': data_path
        },
        {
         'app': 'nextstrain',
         'args': ['shell','.','-c','snakemake -c1'],
         'workdir': workdir
        }
      ]

      win.webContents.executeJavaScript('elementDisabled(true)')
      myWorker2.postMessage(run_obj)
      myWorker2.on('message', (nextstrain_result) => {
        //nextstrain shell . -c "snakemake -c1"
        log.info(nextstrain_result)
        //log.info('stdin: ', nextstrain_result[0]['result'].stdin)
        //log.info('stdout: ', nextstrain_result[0]['result'].stdout)
        //log.info('stderr: ', nextstrain_result[0]['result'].stderr)
        //log.info('error: ', nextstrain_result[0]['result'].error)
        win.webContents.executeJavaScript('elementDisabled(false)')
        win.webContents.executeJavaScript('alert("Complete")')
      })
    }
    )

    ipcMain.on('runShell', (event, items) => {
      log.info('아이템: ',items)
      if ( items.value.length > 0 ){
        for ( let item in items.value ) {
          q_list.push(item)
        }
  
        win.webContents.executeJavaScript('progress_result("'+q_list.length+'")')
        
        win.webContents.executeJavaScript('elementDisabled(true)')
        //win.webContents.executeJavaScript('document.querySelector("div.loading-container").style.display = "block"')  
        myWorker.on('message', (obj) => {
            let result = obj['result']
            let item = obj['item']
            let app = obj['app']
            let args = obj['args']
            let bams = obj['bams']
            let bams_L = bams['L']
            let bams_M = bams['M']
            let bams_S = bams['S']          
            log.info('app: ', app)
            log.info('args: ', args)
            cmd = app
            for ( let arg in args ) {
              cmd += " " + args[arg]
            }
            log.info('cmd: ', cmd)
            log.info('stdin: ', result.stdin)
            log.info('stdout: ', result.stdout)
            log.info('stderr: ', result.stderr)
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
              win.webContents.executeJavaScript('elementDisabled(false)')
              win.webContents.executeJavaScript('alert("Complete")')
             }
          }
        );
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

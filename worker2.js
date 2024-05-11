const { parentPort } = require('worker_threads');
const log = require('electron-log')
const { spawnSync, execSync } = require("child_process");

parentPort.on('message', (items) => {
  log.info('items: ', items)
  results = []
  for ( index in items ){
    run_obj = items[index]
    log.info(run_obj)

    app = run_obj['app']
    args = run_obj['args']
    workdir = run_obj['workdir']


    result = spawnSync(app, args, {encoding: 'utf-8', cwd: workdir})
    let obj = {
      'result': result,
      'item': run_obj
    }
    results.push(obj)

  } 
  parentPort.postMessage(results);
});



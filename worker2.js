const { parentPort } = require('worker_threads');
const log = require('electron-log')
const { spawnSync, execSync } = require("child_process");

parentPort.on('message', (obj) => {
  log.info('obj: ', obj)
  results = {
    'strain_type': obj['strain_type'],
    'result_file': obj['result_file'],
    'workdir': obj['workdir'],
    'result': []
  }
  for ( index in items ){
    run_obj = items[index]
    log.info(run_obj)

    app = run_obj['app']
    args = run_obj['args']
    workdir = run_obj['workdir']


    result = spawnSync(app, args, {encoding: 'utf-8', cwd: workdir})
    let result_obj = {
      'result': result,
      'item': run_obj
    }
    results['result'].push(result_obj)
  }
  parentPort.postMessage(results);
});



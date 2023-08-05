const { parentPort } = require('worker_threads');
const log = require('electron-log')
const { spawnSync } = require("child_process");
const fs = require('fs');

function file_write(file_path, content, new_file=false){
  if ((fs.existsSync(file_path)) && (new_file==false)){
    fs.appendFile(file_path, content, 'utf-8', (err) => {});
  } else {
    fs.writeFile(file_path, content, 'utf-8', (err) => {});
  }
}

function file_read(file_path, read_type='text'){
  fs.readFile(file_path, 'utf-8', (err, data) => {
    if (err) {
      return err
    }

    if (read_type == "json") {
      data = JSON.parse(data)
    }
    log.info(data)
    return data
  });
}

parentPort.on('message', (items) => {
  //log.info('수신: ',item)
  if ( items.value.length > 0 ){
    for ( let index in items.value ){
        let item = items.value[index]
        let base_path = item['basePath']
        let data_path = item['dataPath']
        let ref_path = base_path + '/ref/'
        let result_path = data_path + '/result/'
        let itemId = item["itemId"]
        let value = item["value"]
        let value_split = String(value).split('/')
        let value_split2 = String(value_split[value_split.length - 1]).split('.')
        let option = item["option"]
        let option_name = option['name']
        let option_L = ref_path + option_name + '/' + option['L']
        let option_M = ref_path + option_name + '/' + option['M']
        let option_S = ref_path + option_name + '/' + option['S']
        let threshold = item['threshold']
        let nextstrain_L = ''
        let nextstrain_M = ''
        let nextstrain_S = ''
        
        //micromamba run -n KU-ONT-Hantavirus-consensus nextflow
        //nextflow ./main.nf --fastq ./SEOV_80-39_10-5.fastq --prefix test --outdir test_output --L ./SEOV_Ref/SEOV_80-39_L.fasta --M ./SEOV_Ref/SEOV_80-39_M.fasta --S ./SEOV_Ref/SEOV_80-39_S.fasta
        log.info(value)
        log.info(value_split)
        log.info(value_split2)
        //nextstrain shell . -c "snakemake -c1"
        let app = 'micromamba'
        let args = [
          'run', '-n', 'KU-ONT-Hantavirus-consensus','nextflow',
          //'-log', '"'+data_path+'/nextflow.log"',
          //'-c', '"'+data_path+'/nextflow.config"',
          'run', '"' + data_path + '/main.nf"',
          '--fastq', value,
          '--prefix', value_split2[0],
          '--outdir', result_path + value_split2[0],
          '--L', option_L,
          '--M', option_M,
          '--S', option_S,
          '--low-cov-threshold', threshold,
          //'--log', '"'+data_path+'/logfile.log"',
          //'-w', data_path
        ]
        result = spawnSync(app, args, {encoding: 'utf-8', cwd: data_path})//, 
        let out = result.stdout
        
        if (result.error) {
          log.info(result.error)
        } else {
          //log.info(result.stdout.toString())
          log.info('완료: ', item)
        }
        let bams_L = result_path + value_split2[0] + "/bams/" + value_split2[0] + "_L.bam"
        let bams_M = result_path + value_split2[0] + "/bams/" + value_split2[0] + "_M.bam"
        let bams_S = result_path + value_split2[0] + "/bams/" + value_split2[0] + "_S.bam"
        let obj = {
          'item': item,
          'result': result,
          'app': app,
          'args': args,
          'bams': {
            'name': value_split2[0],
            'L': bams_L,
            'M': bams_M,
            'S': bams_S
          }
        }
         
        if (fs.existsSync(bams_L)) {
          bam_data = file_read(bams_L)
          input_text = bam_data
          file_write(file_path=nextstrain_L, content=input_text)
        }

        if (fs.existsSync(bams_M)) {
          bam_data = file_read(bams_M)
          input_text = bam_data
          file_write(file_path=nextstrain_M, content=input_text)
        }

        if (fs.existsSync(bams_S)) {
          bam_data = file_read(bams_S)
          input_text = bam_data
          file_write(file_path=nextstrain_S, content=input_text)
        }

        parentPort.postMessage(obj); 
    }
  }

  log.info('끝')
});

const { parentPort } = require('worker_threads');
const log = require('electron-log')
const { spawnSync } = require("child_process");


parentPort.on('message', (items) => {
  //log.info('수신: ',item)

  if ( items.value.length > 0 ){
    for ( let index in items.value ){
        let item = items.value[index]
        let base_path = item['basePath']
        let ref_path = base_path + '/ref/'
        let result_path = base_path + '/result/'
        let itemId = item["itemId"]
        let value = item["value"]
        let value_split = String(value).split('/')
        let value_split2 = String(value_split[value_split.length - 1]).split('.')
        let option = item["option"]
        let option_name = option['name']
        let option_L = ref_path + option_name + '/' + option['L']
        let option_M = ref_path + option_name + '/' + option['M']
        let option_S = ref_path + option_name + '/' + option['S']
        //micromamba run -n KU-ONT-Hantavirus-consensus nextflow
        //nextflow ./main.nf --fastq ./SEOV_80-39_10-5.fastq --prefix test --outdir test_output --L ./SEOV_Ref/SEOV_80-39_L.fasta --M ./SEOV_Ref/SEOV_80-39_M.fasta --S ./SEOV_Ref/SEOV_80-39_S.fasta
        log.info(value)
        log.info(value_split)
        log.info(value_split2)

        result = spawnSync('micromamba', ['run', '-n', 'KU-ONT-Hantavirus-consensus', 'nextflow', '/home/jwsonglab/Desktop/kmpark/git/Hantacon/dist/linux-unpacked/main.nf', '--fastq', value, '--prefix', value_split2[0], '--outdir', result_path + value_split2[0], '--L', option_L, '--M', option_M, '--S', option_S]);

        if (result.error) {
          log.info(result.error)
        } else {
          //log.info(result.stdout.toString())
          log.info('완료: ', item)
        }
    
        parentPort.postMessage(item); 
    }
  }

  log.info('끝')
});
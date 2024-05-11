const { parentPort } = require('worker_threads');
const log = require('electron-log')
const { spawnSync } = require("child_process");

parentPort.on('message', (obj) => {
  //log.info('수신: ',item)
  config = obj['config']
  items = obj['items']

  if ( items.value.length > 0 ){
    for ( let index in items.value ){
        let item = items.value[index]
        let base_path = item['basePath']
        let data_path = item['dataPath']
        let ref_path = data_path + '/ref/'
        let result_path = data_path + '/result/'
        let itemId = item["itemId"]
        let value = item["value"]
        let value_split = String(value).split('/')
        let value_split2 = String(value_split[value_split.length - 1]).split('.')
        let result_name = value_split2[0]
        let option = item["option"]
        let option_name = option['name']
        let option_L = ref_path + option_name + '/' + option['L']
        let option_M = ref_path + option_name + '/' + option['M']
        let option_S = ref_path + option_name + '/' + option['S']
        let threshold = item['threshold']
        //let nextstrain_L = data_path + '/nextstrain/htv_L/data/'
        //let nextstrain_M = data_path + '/nextstrain/htv_M/data/'
        //let nextstrain_S = data_path + '/nextstrain/htv_S/data/'
        //let sequence_L = nextstrain_L + 'sequence.fasta'
        //let metadata_L = nextstrain_L + 'metadata.tsv'
        //let sequence_M = nextstrain_M + 'sequence.fasta'
        //let metadata_M = nextstrain_M + 'metadata.tsv'
        //let sequence_S = nextstrain_S + 'sequence.fasta'
        //let metadata_S = nextstrain_S + 'metadata.tsv'

        //let nextstrain_run = item['nextstrain']
        //let accession = item['nextstrain_option']['accession']

        //let host = ""//item['nextstrain_option']['host']
        //let gec = ""//item['nextstrain_option']['genetic exchange']        
        //let lineage = ""//item['nextstrain_option']['lineage']
        //let hz = ""//item['nextstrain_option']['hybrid zone']
        //let accession = ""//item['nextstrain_option']['hybrid zone']
        //let date = item['nextstrain_option']['date']
        //let province = item['nextstrain_option']['province']
        //let country = item['nextstrain_option']['country']
        //let city = item['nextstrain_option']['city']
        //let town = item['nextstrain_option']['town']
        //let db = ""//item['nextstrain_option']['country']
        //let title = ""//item['nextstrain_option']['country']
        //let journal = ""//item['nextstrain_option']['country']
        //let paper_url = ""//item['nextstrain_option']['country']

        //let metadata_text = result_name + "\t"
        //metadata_text += host + "\t"
        //metadata_text += gec + "\t"
        //metadata_text += lineage + "\t"
        //metadata_text += hz + "\t"
        //metadata_text += accession + "\t"
        //metadata_text += date + "\t"
        //metadata_text += province + "\t"
        //metadata_text += country + "\t"
        //metadata_text += city + "\t"
        //metadata_text += town + "\t"
        //metadata_text += db + "\t"
        //metadata_text += title + "\t"
        //metadata_text += journal + "\t"
        //metadata_text += paper_url + "\n"
        


        //micromamba run -n KU-ONT-Hantavirus-consensus nextflow
        //nextflow ./main.nf --fastq ./HTNV_Aa19-36.fastq --prefix test --outdir test_output --L ./ref/HTNV_76-118/HTNV_76-118_L.fasta --M ./HTNV_76-118/HTNV_76-118_M.fasta --S ./HTNV_76-118/HTNV_76-118_S.fasta
        log.info(value)
        log.info(value_split)
        log.info(value_split2)
        //nextstrain shell . -c "snakemake -c1"
        let app = config['app']['conda']//'micromamba'
        let args = [
          'run', '-n', config['app']['env_name'], 'nextflow',
          //'-log', '"'+data_path+'/nextflow.log"',
          //'-c', '"'+data_path+'/nextflow.config"',
          'run', '"' + data_path + '/main.nf"',
          '--fastq', value,
          '--prefix', result_name,
          '--outdir', result_path + result_name,
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
        
        let consensus_L = result_path + result_name + "/" + result_name + "_L.consensus.fasta"
        let consensus_M = result_path + result_name + "/" + result_name + "_M.consensus.fasta"
        let consensus_S = result_path + result_name + "/" + result_name + "_S.consensus.fasta"
        let bams_L = result_path + result_name + "/bams/" + result_name + "_L.bam"
        let bams_M = result_path + result_name + "/bams/" + result_name + "_M.bam"
        let bams_S = result_path + result_name + "/bams/" + result_name + "_S.bam"

        let obj = {
          'name': result_name,
          'item': item,
          'result': result,
          'app': app,
          'args': args,
          'bams': {
            'L': bams_L,
            'M': bams_M,
            'S': bams_S
          },
          'consensus': {
            'L': consensus_L,
            'M': consensus_M,
            'S': consensus_S
          }
        }
        
        parentPort.postMessage(obj); 
    }
  }

  log.info('끝')
});


parentPort.on('run_shell', (run_obj) => {
  app = run_obj['app']
  args = run_obj['args']
  workdir = run_obj['workdir']
  result = spawnSync(app, args, {encoding: 'utf-8', cwd: workdir})//, 
  parentPort.postMessage(result);
});


//conda run nextflow run "/home/grey/hantacon/main.nf" --fastq /home/grey/hantacon/HTNV_Aa19-36.fastq --prefix HTNV_Aa19-36 --outdir /home/grey/hantacon/result/HTNV_Aa19-36 --L /home/grey/hantacon/ref/HTNV_76-118/HTNV_76-118_L.fasta --M /home/grey/hantacon/ref/HTNV_76-118/HTNV_76-118_M.fasta --S /home/grey/hantacon/ref/HTNV_76-118/HTNV_76-118_S.fasta --low-cov-threshold 10
//conda run nextflow run "/home/grey/hantacon/main.nf" --fastq /home/grey/hantacon/HTNV_Aa19-36.fastq --prefix HTNV_Aa19-36 --outdir /home/grey/hantacon/result/HTNV_Aa19-36 --L /home/grey/hantacon/ref/HTNV_76-118/HTNV_76-118_L.fasta --M /home/grey/hantacon/ref/HTNV_76-118/HTNV_76-118_M.fasta --S /home/grey/hantacon/ref/HTNV_76-118/HTNV_76-118_S.fasta --low-cov-threshold 10
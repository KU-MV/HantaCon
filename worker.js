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
        let result_name = value_split2[0]
        let option = item["option"]
        let option_name = option['name']
        let option_L = ref_path + option_name + '/' + option['L']
        let option_M = ref_path + option_name + '/' + option['M']
        let option_S = ref_path + option_name + '/' + option['S']
        let threshold = item['threshold']
        let nextstrain_L = data_path + '/nextstrain/htv_L/data/'
        let nextstrain_M = data_path + '/nextstrain/htv_M/data/'
        let nextstrain_S = data_path + '/nextstrain/htv_S/data/'
        let sequence_L = nextstrain_L + 'sequence.fasta'
        let metadata_L = nextstrain_L + 'metadata.tsv'
        let sequence_M = nextstrain_M + 'sequence.fasta'
        let metadata_M = nextstrain_M + 'metadata.tsv'
        let sequence_S = nextstrain_S + 'sequence.fasta'
        let metadata_S = nextstrain_S + 'metadata.tsv'

        let virus = item['nextstrain']['virus']
        let accession = item['nextstrain']['accession']
        let date = item['nextstrain']['date']

        let host = item['nextstrain']['host']
        let region = item['nextstrain']['region']
        let country = item['nextstrain']['country']

        let city = item['nextstrain']['city']
        let town = item['nextstrain']['town']
        let db = item['nextstrain']['db']

        let author = item['nextstrain']['author']
        let url = item['nextstrain']['url']
        let title = item['nextstrain']['title']

        let journal = item['nextstrain']['journal']
        let paper_url = item['nextstrain']['paper_url']

        let metadata_text = virus + "\t"
        metadata_text += accession + "\t"
        metadata_text += date + "\t"
        metadata_text += host + "\t"
        metadata_text += region + "\t"
        metadata_text += country + "\t"
        metadata_text += city + "\t"
        metadata_text += town + "\t"
        metadata_text += db + "\t"
        metadata_text += author + "\t"
        metadata_text += url + "\t"
        metadata_text += title + "\t"
        metadata_text += journal + "\t"
        metadata_text += paper_url + "\n"


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
        let bams_L = result_path + result_name + "/bams/" + result_name + "_L.bam"
        let bams_M = result_path + result_name + "/bams/" + result_name + "_M.bam"
        let bams_S = result_path + result_name + "/bams/" + result_name + "_S.bam"
        let obj = {
          'item': item,
          'result': result,
          'app': app,
          'args': args,
          'bams': {
            'name': result_name,
            'L': bams_L,
            'M': bams_M,
            'S': bams_S
          }
        }
         
        if (fs.existsSync(bams_L)) {
          bam_data = file_read(bams_L)
          input_text = ">" + result_name + "\n" + bam_data + "\n"
          file_write(file_path=sequence_L, content=input_text)
          file_write(file_path=metadata_L, content=metadata_text)
        }

        if (fs.existsSync(bams_M)) {
          bam_data = file_read(bams_M)
          input_text = ">" + result_name + "\n" + bam_data + "\n"
          file_write(file_path=sequence_M, content=input_text)
          file_write(file_path=metadata_M, content=metadata_text)
        }

        if (fs.existsSync(bams_S)) {
          bam_data = file_read(bams_S)
          input_text = ">" + result_name + "\n" + bam_data + "\n"
          file_write(file_path=sequence_S, content=input_text)
          file_write(file_path=metadata_S, content=metadata_text)
        }

        parentPort.postMessage(obj); 
    }
  }

  log.info('끝')
});

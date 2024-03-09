nextflow.enable.dsl=2

include { consensus as consensus_l; consensus as consensus_m; consensus as consensus_s } from './consensus'

workflow {
    main:
        if( params.help ) {
            help = """main.nf: Nextflow script to generate the consensus sequence of Hantavirus from Nanopore sequenicng datset
                    |Required arguments:
                    |  --fastq  Location of the input FASTQ file.
                    |  --prefix  Prefix of the run.
                    |  --outdir  Location output consensus will be saved to.
                    |
                    |Optional arguments:
                    |  --L   L segment reference in FASTA format.
                    |  --M   M segment reference in FASTA format.
                    |  --S   S segment reference in FASTA format.""".stripMargin()
            // Print the help with the stripped margin and exit
            println(help)
            exit(0)
        }

        Channel.fromPath(params.fastq).set{fastq}
        Channel.fromPath(params.L).set{lseg}
        Channel.fromPath(params.M).set{mseg}
        Channel.fromPath(params.S).set{sseg}
        all_seg = catFiles(lseg, mseg, sseg)
        l_acc = extractName_l(lseg)
        m_acc = extractName_m(mseg)
        s_acc = extractName_s(sseg)
        mapReads(fastq, all_seg, l_acc, m_acc, s_acc)
        consensus_l(mapReads.out.L, lseg)
        consensus_m(mapReads.out.M, mseg)
        consensus_s(mapReads.out.S, sseg)
}

process catFiles {
    input:
        path lseg
        path mseg
        path sseg
    output:
        path "all_segments.fasta"
    """
    cat $lseg <(echo) $mseg <(echo) $sseg > all_segments.fasta
    """ 
}

process extractName_l {
    conda 'KU-ONT-Hantavirus-consensus'
    input:
        path seg
    output:
        stdout
    """
    seqkit seq -n $seg | cut -d ' ' -f 1
    """
}

process extractName_m {
    conda 'KU-ONT-Hantavirus-consensus'
    input:
        path seg
    output:
        stdout
    """
    seqkit seq -n $seg | cut -d ' ' -f 1
    """
}

process extractName_s {
    conda 'KU-ONT-Hantavirus-consensus'
    input:
        path seg
    output:
        stdout
    """
    seqkit seq -n $seg | cut -d ' ' -f 1
    """
}

process mapReads {
    conda 'KU-ONT-Hantavirus-consensus'
    publishDir "${params.outdir}", mode: 'copy'
    tag "${params.prefix}:mapReads"

    input:
        path fastq
        path all_seg
        val l_acc
        val m_acc
        val s_acc
    output:
        path "bams/${params.prefix}_L.bam", emit: L
        path "bams/${params.prefix}_M.bam", emit: M
        path "bams/${params.prefix}_S.bam", emit: S
    """
    mini_align -t 8 -p ${params.prefix} -i $fastq -r $all_seg -m -f -M 2 -S 4 -O 4,24 -E 2,1
    samtools sort ${params.prefix}.bam -o ${params.prefix}.sort.bam
    samtools index ${params.prefix}.sort.bam

    mkdir bams
    samtools view -o bams/${params.prefix}_L.bam -b ${params.prefix}.sort.bam $l_acc
    samtools view -o bams/${params.prefix}_M.bam -b ${params.prefix}.sort.bam $m_acc
    samtools view -o bams/${params.prefix}_S.bam -b ${params.prefix}.sort.bam $s_acc
    """
}


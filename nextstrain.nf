nextflow.enable.dsl=2

workflow {
    main:
        test(params.basepath)
}

process test {
    input:
        path basepath
    output:
    """
    rm -f $basepath/data/sequence_origin.fasta
    mv $basepath/data/sequence.fasta $basepath/data/sequence_origin.fasta
    mafft $basepath/data/sequence_origin.fasta > $basepath/data/sequence.fasta
    """
}

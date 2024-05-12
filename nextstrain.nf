nextflow.enable.dsl=2

workflow {
    main:
        test(params.basepath, params.workdir, params.copypath, params.reset)
}

process test {
    debug true
    input:
        path basepath
        path workdir
        path copypath
        val reset
    output:
        path $workdir/data/sequence.fasta
    script:
    """
    rm -f $workdir/data/sequence_origin.fasta
    mv $workdir/data/sequence.fasta $workdir/data/sequence_origin.fasta
    mafft $workdir/data/sequence_origin.fasta > $workdir/data/sequence.fasta
    """
}
nextflow.enable.dsl=2

workflow {
    main:
        test(params.workdir, params.outfile)
}

process test {
    debug true
    input:
        path workdir
        path outfile
    output:
        path outfile
    script:
    """
    rm -f $workdir/data/sequence_origin.fasta
    mv $workdir/data/sequence.fasta $workdir/data/sequence_origin.fasta
    nextstrain shell . mafft $workdir/data/sequence_origin.fasta > $outfile
    """
}
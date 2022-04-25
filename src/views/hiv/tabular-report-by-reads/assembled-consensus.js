function assembledConsensus({
  sequenceReadsAnalysis
}) {
  const fasta = [];
  const unambiFasta = [];
  for (const seqResult of sequenceReadsAnalysis) {
    const {
      name,
      assembledConsensus: seq,
      assembledUnambiguousConsensus: unambiSeq,
      maxMixtureRate,
      minPrevalence,
      minCodonReads
    } = seqResult;
    fasta.push(
      `>${
        name
      } cdreads: ${
        minCodonReads
      }; cutoff: ${
        minPrevalence
      }; mixrate: ${
        maxMixtureRate
      }`
    );
    fasta.push(seq);
    unambiFasta.push(
      `>${
        name
      } unambiguous NA only; cdreads: ${
        minCodonReads
      }`
    );
    unambiFasta.push(unambiSeq);
  }
  return [{
    tableName: 'consensusSequences-AmbiguousNA',
    fileExt: '.fas',
    mimeType: 'application/fasta',
    payload: fasta.join('\n')
  }, {
    tableName: 'consensusSequences-UnambiguousNA',
    fileExt: '.fas',
    mimeType: 'application/fasta',
    payload: unambiFasta.join('\n')
  }];
}

export default assembledConsensus;

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
      minPositionReads
    } = seqResult;
    fasta.push(
      `>${
        name
      } posreads: ${
        minPositionReads
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
      } unambiguous NA only; posreads: ${
        minPositionReads
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

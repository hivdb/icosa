function assembledConsensus({
  sequenceReadsAnalysis
}) {
  const fasta = [];
  for (const seqResult of sequenceReadsAnalysis) {
    const {
      name,
      assembledConsensus: seq,
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
  }
  return [{
    tableName: 'consensusSequences',
    fileExt: '.fas',
    mimeType: 'application/fasta',
    payload: fasta.join('\n')
  }];
}

export default assembledConsensus;

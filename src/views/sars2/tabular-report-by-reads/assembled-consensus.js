function assembledConsensus({
  sequenceReadsAnalysis
}) {
  const fasta = [];
  for (const seqResult of sequenceReadsAnalysis) {
    const {
      name,
      assembledConsensus: seq,
      maxMixturePcnt,
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
      }; mixpcnt: ${
        maxMixturePcnt
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

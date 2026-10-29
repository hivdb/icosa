import rawJSON from '../../../components/tabular-report/raw-json';
import {isMajorMutation} from '../drm';

export default function jsonReport(props) {
  const sequenceAnalysis = props.sequenceAnalysis.map(seqResult => ({
    ...seqResult,
    alignedGeneSequences: seqResult.alignedGeneSequences.map(geneSeq => ({
      ...geneSeq,
      mutations: geneSeq.mutations.map(mutation => ({
        ...mutation,
        mutationType: mutation.isUnsequenced ? null :
          (isMajorMutation(geneSeq.gene.name, mutation) ? 'Major' : 'Other')
      }))
    }))
  }));
  return rawJSON({...props, sequenceAnalysis});
}

import gql from 'graphql-tag';
import {
  rootLevel,
  seqLevelMutComments,
  seqLevelSuscSummary,
  geneSeqLevel
} from '../common-query.graphql';

export default gql`
  fragment ReportByPatternRoot on Root {
    ${rootLevel}
  }
  fragment ReportByPattern on MutationsAnalysis {
    name
    validationResults(includeGenes: [_3CLpro, RdRP, S]) {
      level
      message
    }
    ${seqLevelMutComments}
    ${seqLevelSuscSummary}
    allGeneMutations {
      ${geneSeqLevel}
    }
  }
`;

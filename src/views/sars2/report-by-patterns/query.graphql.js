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
    validationResults {
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

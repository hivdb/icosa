import gql from 'graphql-tag';
import {
  seqLevel,
  geneSeqLevel
} from '../common-query.graphql';

export default gql`
  fragment ReportByPattern on MutationsAnalysis {
    name
    validationResults {
      level
      message
    }
    ${seqLevel}
    allGeneMutations {
      ${geneSeqLevel}
    }
  }
`;

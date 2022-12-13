import gql from 'graphql-tag';
import {
  geneSeqLevel
} from '../common-query.graphql';

export default gql`
  fragment ReportByPattern on MutationsAnalysis {
    name
    validationResults() {
      level
      message
    }
    allGeneMutations {
      ${geneSeqLevel}
    }
  }
`;

import gql from 'graphql-tag';
import {geneSeqLevel} from '../hbv/common-query.graphql';

export default gql`
  fragment HCVPatternReport on MutationsAnalysis {
    name
    validationResults { level message }
    allGeneMutations {
      ${geneSeqLevel}
    }
  }
`;

import gql from 'graphql-tag';

export default gql`
  fragment HCVPatternReport on MutationsAnalysis {
    name
    validationResults { level message }
    allGeneMutations {
      gene { name }
      mutations { text isDRM isUnusual }
    }
  }
`;

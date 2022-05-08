import React from 'react';
import gql from 'graphql-tag.macro';
import PropTypes from 'prop-types';
import '../../../styles/griddle-table.scss';


import style from '../style.module.scss';

import {
  subtypeDisplayNames,
  mutationPrevalencesToTableData
} from './common';
import PrevalenceData from './prevalence-data';
import PrevalenceMutCol from './prevalence-mut-col';
import GeneMutationPrevalence from './gene-mutation-prevalence';


function getColumnMetadata(subtypeStats, gene) {
  let columnMetadata = [
    {
      columnName: 'mutation',
      displayName: 'Mutation',
      customComponent: PrevalenceMutCol
    },
    {
      columnName: 'triplet',
      displayName: 'NAs'
    }
  ];

  for (const type of ['Naive', 'Treated']) {
    columnMetadata = columnMetadata.concat(subtypeStats.map(
      ({name, stats}) => {
        let result;
        for (const stat of stats) {
          if (stat.gene.name !== gene) {
            continue;
          }
          const total = stat[`total${type}`];
          const display = subtypeDisplayNames[name] || name;
          result = {
            columnName: `${type.toLowerCase()}${name}`,
            displayName: (
              <span>
                {display}<br />
                <small>N={total}</small>
              </span>
            ),
            cssClassName: style['prevalence-data'],
            customComponent: PrevalenceData
          };
          break;
        }
        return result;
      }
    ));
  }
  return columnMetadata;
}


export default class SeqMutationPrevalence extends React.Component {

  static propTypes = {
    mutationPrevalenceSubtypes: PropTypes.array.isRequired,
    mutationPrevalences: PropTypes.array.isRequired,
    drugResistance: PropTypes.array.isRequired
  };

  render() {
    let {
      mutationPrevalenceSubtypes: subtypeStats,
      mutationPrevalences,
      drugResistance: allMutationComments
    } = this.props;
    const rowsByGenes =
      mutationPrevalencesToTableData(mutationPrevalences, subtypeStats);
    subtypeStats = subtypeStats
      .filter(({name}) => !(/^(All|Other)$/.test(name)));
    allMutationComments = allMutationComments
      .reduce((map, mutComments) => {
        map[mutComments.gene.name] = mutComments;
        return map;
      }, {});

    const columns = ['mutation', 'triplet']
      .concat(subtypeStats.map(({name}) => `naive${name}`))
      .concat(subtypeStats.map(({name}) => `treated${name}`));

    // the data source of rowsByGenes (mutationPrevalences) is
    // different from allMutationComments. This forloop is intent
    // to check if the data synced.
    for (let gene of Object.keys(rowsByGenes)) {
      if (!allMutationComments[gene]) {
        return null;
      }
    }

    return (
      <div>
        {Object.entries(rowsByGenes).map(([gene, rows], idx) => (
          <GeneMutationPrevalence
           key={idx} gene={gene}
           columnMetadata={getColumnMetadata(subtypeStats, gene)}
           rows={rows} columns={columns}
           mutationComments={allMutationComments[gene]} />
        ))}
      </div>
    );
  }

}

const query = gql`
  fragment SeqMutPrev_MutationPrevalenceSubtypesQuery
    on MutationPrevalenceSubtype
  {
    name
    stats {
      gene {name}
      totalNaive
      totalTreated
    }
  }

  fragment SeqMutPrev_MutationPrevalencesQuery on BoundMutationPrevalence {
    boundMutation {
      text position consensus triplet gene {name}
    }
    matched {
      AA
      subtypes {
        subtype {name}
        percentageNaive
        percentageTreated
      }
    }
    others {
      AA
      subtypes {
        subtype {name}
        percentageNaive
        percentageTreated
      }
    }
  }

  fragment SeqMutPrev_DrugResistanceQuery on DrugResistance {
    gene { name }
    commentsByTypes {
      commentType
      comments {
        name
        text
        highlightText
      }
    }
  }
`;

export {query};

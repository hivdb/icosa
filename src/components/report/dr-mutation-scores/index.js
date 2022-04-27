import React from 'react';
import PropTypes from 'prop-types';

import {H3} from '../../heading-tags';
import {parseMutation} from '../../../utils/mutation';
import SimpleTable, {ColumnDef} from '../../simple-table';

import ReportSection from '../report-section';
import parentStyle from '../style.module.scss';

import style from './style.module.scss';


function scoresToTableData(
  scores: Array<{
    drug: {name: string},
    score: number,
    partialScores: Array<{
      mutations: {text: string},
      score: number
    }>
  }>
) {
  if (scores.length === 0) {
    return [];
  }
  const map = new Map();
  for (const {drug, partialScores} of scores) {
    for (const mutScore of partialScores) {
      const rule = mutScore.mutations.map(({text}) => text).join(' + ');
      if (!map.has(rule)) {
        // set default values
        map.set(rule, scores.reduce((row, drugScore2) => {
          row[drugScore2.drug.name] = 0;
          return row;
        }, {rule}));
      }
      const row = map.get(rule);
      row[drug.name] = mutScore.score;
    }
  }
  const totalRow = {rule: 'Total'};
  for (const {drug: {name}, score} of scores) {
    totalRow[name] = score;
  }
  return [...map.values(), totalRow];
}


DRClassMutScores.propTypes = {
  drugClass: PropTypes.object.isRequired,
  scores: PropTypes.array.isRequired,
  disabledDrugs: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired
};


DRClassMutScores.defaultProps = {
  disabledDrugs: []
};


function DRClassMutScores({drugClass, scores, disabledDrugs}) {

  const disabledDrugSet = React.useMemo(
    () => new Set(disabledDrugs),
    [disabledDrugs]
  );

  const colDefs = React.useMemo(
    () => [
      new ColumnDef({
        name: 'rule',
        render: rule => {
          const [pos] = parseMutation(rule);
          return rule === 'Total' ? <span>{rule}</span> : (
            <a
             className={parentStyle['link-style']}
             href={`/cgi-bin/Marvel.cgi?pos=${pos}&class=${drugClass.name}`}>
              {rule}
            </a>
          );
        },
        sortable: false
      }),
      ...scores
        .filter(
          ({drug}) => !disabledDrugSet.has(drug.name)
        )
        .map(
          ({drug}) => new ColumnDef({
            name: drug.name,
            label: drug.displayAbbr
          })
        )
    ],
    [disabledDrugSet, drugClass.name, scores]
  );

  const data = React.useMemo(() => scoresToTableData(scores), [scores]);
  if (data.length <= 2) {
    data.pop();
  }

  return <>
    {data.length > 0 ? <>
      <H3
       disableAnchor
       data-with-table
       className={style['dr-mutation-scores-table-header']}>
        Drug resistance mutation scores of {drugClass.name}
      </H3>
      <SimpleTable
       compact
       lastCompact
       className={style['dr-mutation-scores-table']}
       columnDefs={colDefs}
       data={data}
       cacheKey={drugClass.name}
       key={drugClass.name} />
    </> :
    <H3 disableAnchor className={style['dr-mutation-scores-table-header']}>
      No drug resistance mutations were found for {drugClass.name}.
    </H3>}
  </>;
}


DRMutationScores.propTypes = {
  geneDR: PropTypes.object.isRequired,
  disabledDrugs: PropTypes.arrayOf(
    PropTypes.string.isRequired
  )
};


export default function DRMutationScores({geneDR, disabledDrugs}) {
  const {algorithm, gene} = geneDR;
  return (
    <ReportSection
     title={`Mutation scoring: ${gene.name}`}>
      <div className={parentStyle['header-annotation']}>
        {algorithm.family} {algorithm.version} ({algorithm.publishDate})
      </div>
      {geneDR.gene.drugClasses.map((drugClass, idx) => {
        return <DRClassMutScores
         key={idx}
         {...{drugClass, disabledDrugs}}
         scores={geneDR.drugScores.filter(
           ds => ds.drugClass.name === drugClass.name
         )}
        />;
      })}
    </ReportSection>
  );
}

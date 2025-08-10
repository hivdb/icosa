import React from 'react';

import {H3} from '../../heading-tags';
import {parseMutation} from '../../../utils/mutation';

import ReportSection from '../report-section';
import parentStyle from '../style.module.scss';

import style from './style.module.scss';

interface PartialScore {
  mutations: {text: string}[];
  score: number;
}

interface DrugScore {
  drug: {name: string; displayAbbr: string};
  score: number;
  partialScores: PartialScore[];
  drugClass?: {name: string};
}

interface DrugClass {
  name: string;
  fullName: string;
}

/**
 * Convert drug score data into a table-friendly structure.
 */
function scoresToTableData(scores: DrugScore[]): Record<string, any>[] {
  if (scores.length === 0) {
    return [];
  }
  const map = new Map<string, Record<string, any>>();
  for (const {drug, partialScores} of scores) {
    for (const mutScore of partialScores) {
      const rule = mutScore.mutations.map(({text}) => text).join(' + ');
      if (!map.has(rule)) {
        // set default values
        map.set(
          rule,
          scores.reduce((row, drugScore2) => {
            row[drugScore2.drug.name] = 0;
            return row;
          }, {rule} as Record<string, any>)
        );
      }
      const row = map.get(rule)!;
      row[drug.name] = mutScore.score;
    }
  }
  const totalRow: Record<string, any> = {rule: 'Total'};
  for (const {drug: {name}, score} of scores) {
    totalRow[name] = score;
  }
  return [...map.values(), totalRow];
}

interface DRClassMutScoresProps {
  drugClass: DrugClass;
  scores: DrugScore[];
  disabledDrugs?: string[];
}

/**
 * Render mutation scores for a specific drug class.
 */
function DRClassMutScores({drugClass, scores, disabledDrugs = []}: DRClassMutScoresProps) {
  const disabledDrugSet = React.useMemo(() => new Set(disabledDrugs), [disabledDrugs]);

  const colDefs = React.useMemo(
    () => [
      {
        name: 'rule',
        label: 'rule',
        render: (rule: string) => {
          const [pos] = parseMutation(rule);
          return rule === 'Total' ? (
            <span>{rule}</span>
          ) : (
            <a
              className={parentStyle['link-style']}
              href={`/cgi-bin/Marvel.cgi?pos=${pos}&class=${drugClass.name}`}
            >
              {rule}
            </a>
          );
        }
      },
      ...scores
        .filter(({drug}) => !disabledDrugSet.has(drug.name))
        .map(({drug}) => ({name: drug.name, label: drug.displayAbbr}))
    ],
    [disabledDrugSet, drugClass.name, scores]
  ) as Array<{name: string; label: string; render?: (rule: string) => React.ReactNode}>;

  const data = React.useMemo(() => scoresToTableData(scores), [scores]);
  if (data.length <= 2) {
    data.pop();
  }

  return (
    <>
      {data.length > 0 ? (
        <>
          <H3
            disableAnchor
            data-with-table
            className={style['dr-mutation-scores-table-header']}
          >
            Drug resistance mutation scores of {drugClass.name}:
          </H3>
          <table className={style['dr-mutation-scores-table']}>
            <thead>
              <tr>
                {colDefs.map(col => (
                  <th key={col.name}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rIdx) => (
                <tr key={rIdx}>
                  {colDefs.map(col => (
                    <td key={col.name}>
                      {col.render ? col.render(row[col.name]) : row[col.name]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <H3 disableAnchor className={style['dr-mutation-scores-table-header']}>
          No drug resistance mutations were found for {drugClass.name}.
        </H3>
      )}
    </>
  );
}

interface DRMutationScoresProps {
  geneDR: {
    algorithm: {family: string; version: string; publishDate: string};
    gene: {name: string; drugClasses: DrugClass[]};
    drugScores: DrugScore[];
  };
  disabledDrugs?: string[];
}

/**
 * Display drug resistance mutation scores for each drug class of a gene.
 */
export default function DRMutationScores({geneDR, disabledDrugs = []}: DRMutationScoresProps) {
  const {algorithm, gene} = geneDR;
  return (
    <ReportSection
      title={`Mutation scoring: ${gene.name}`}
      titleAnnotation={
        <>
          {algorithm.family} {algorithm.version} ({algorithm.publishDate})
        </>
      }
    >
      {geneDR.gene.drugClasses.map((drugClass, idx) => (
        <DRClassMutScores
          key={idx}
          {...{drugClass, disabledDrugs}}
          scores={geneDR.drugScores.filter(
            ds => ds.drugClass && ds.drugClass.name === drugClass.name
          )}
        />
      ))}
    </ReportSection>
  );
}

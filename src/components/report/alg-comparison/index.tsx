import React from 'react';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';

import AlgDrugClassComparison from './alg-drugclass-comparison';
import type {AlgComparisonProps} from './types';

import style from '../style.module.scss';

/**
 * Renders tabs comparing genotypic resistance algorithms across drug classes.
 *
 * @param algorithmComparison - List of drug class comparisons, each
 * including a drug class and its associated drug scores.
 * @returns A section containing tabbed algorithm comparisons.
 */
export default function AlgComparison({
  algorithmComparison
}: AlgComparisonProps) {
  const [tabIndex, setTabIndex] = React.useState(0);

  return (
    <section className={style['alg-comparison']}>
      <h2>Comparison of genotypic resistance algorithms</h2>
      <Tabs onSelect={setTabIndex} selectedIndex={tabIndex}>
        <TabList>
          {algorithmComparison.map(({drugClass}, idx) => (
            <Tab key={idx}>{drugClass.name}</Tab>
          ))}
        </TabList>
        {algorithmComparison.map(({drugScores}, idx) => (
          <TabPanel key={idx}>
            <AlgDrugClassComparison drugScores={drugScores} />
          </TabPanel>
        ))}
      </Tabs>
    </section>
  );
}

export type {AlgComparisonProps, DrugScore} from './types';

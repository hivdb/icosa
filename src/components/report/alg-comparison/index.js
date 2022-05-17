import React from 'react';
import PropTypes from 'prop-types';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';

import AlgDrugClassComparison from './alg-drugclass-comparison';

import style from '../style.module.scss';


AlgComparison.propTypes = {
  algorithmComparison: PropTypes.array.isRequired
};

export default function AlgComparison({algorithmComparison}) {
  const [tabIndex, setTabIndex] = React.useState(0);

  return (
    <section className={style['alg-comparison']}>
      <h2>Comparison of genotypic resistance algorithms</h2>
      <Tabs
       onSelect={setTabIndex}
       selectedIndex={tabIndex}>
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

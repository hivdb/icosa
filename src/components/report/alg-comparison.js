import React from 'react';
import gql from 'graphql-tag.macro';
import PropTypes from 'prop-types';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';

import AlgDrugClassComparison from './alg-drugclass-comparison';

import style from './style.module.scss';


export default class AlgComparison extends React.Component {

  static propTypes = {
    algorithmComparison: PropTypes.array.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {tabIndex: 0};
  }

  switchTab = (tabIndex) => {
    this.setState({tabIndex});
  }

  render() {
    const {algorithmComparison} = this.props;
    return (
      <section className={style.algComparison}>
        <h2>Comparison of genotypic resistance algorithms</h2>
        <Tabs
         onSelect={this.switchTab}
         selectedIndex={this.state.tabIndex}>
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

}

const query = gql`
  fragment AlgComparison on AlgorithmComparison {
    drugClass { name }
    drugScores {
      drug { name displayAbbr }
      algorithm
      SIR
      interpretation
      explanation
    }
  }
`;

export {query};

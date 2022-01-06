import React from 'react';
import PropTypes from 'prop-types';
import {routerShape, matchShape, Link} from 'found';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';

import FormsContainer from './container';
import PatternsInputForm from './patterns-input-form';
import SequenceInputForm from './sequence-input-form';
import SequenceReadsInputForm from './sequence-reads-input-form';
import NGS2CodFreqForm from './ngs2codfreq-form';


const tabNames = [
  'by-patterns',
  'by-sequences',
  'by-reads'
];

const tabIndice = tabNames
  .reduce((obj, tabName, idx) => {
    obj[tabName] = idx;
    return obj;
  }, {});


export function getCurrentTab(location) {
  const tabName = location.pathname.replace(/\/$/, '').split(/\//);
  return tabName[tabName.length - 1];
}


export function getBasePath(location) {
  const tabName = location.pathname.replace(/\/$/, '').split(/\//);
  return tabName.slice(0, tabName.length - 1).join('/');
}


AnalyzeForms.propTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  onSubmit: PropTypes.func,
  //onTabSwitch: React.PropTypes.func,
  basePath: PropTypes.string.isRequired,
  patternsTo: PropTypes.string.isRequired,
  sequencesTo: PropTypes.string.isRequired,
  readsTo: PropTypes.string,
  enableReads: PropTypes.bool.isRequired,
  hideReads: PropTypes.bool.isRequired,
  sequencesOutputOptions: PropTypes.object,
  seqReadsOutputOptions: PropTypes.object,
  ngs2codfreqSide: PropTypes.node,
  children: PropTypes.node
};

AnalyzeForms.defaultProps = {
  enableReads: false,
  hideReads: false
};

export default function AnalyzeForms({
  match,
  basePath,
  onSubmit,
  children,
  patternsTo,
  sequencesTo,
  readsTo,
  sequencesOutputOptions,
  seqReadsOutputOptions,
  enableReads,
  hideReads,
  ngs2codfreqSide,
  ...otherProps
}) {

  const tabName = getCurrentTab(match.location);
  const tabIndex = tabIndice[tabName] || 0;

  const commonProps = {...otherProps, onSubmit, children};
  const isCurTabSeqReads = tabIndex === 2;
  const hideTabOthers = enableReads && hideReads && isCurTabSeqReads;
  const hideTabReads = !enableReads && !hideReads;

  return <>
    <FormsContainer>
      {tabName === 'ngs2codfreq' ?
        null :
        <Tabs
         onSelect={() => null}
         selectedIndex={tabIndex}>
          <TabList>
            <Tab style={hideTabOthers ? {display: 'none'} : null}>
              <Link to={`${basePath}/by-patterns/`}>
                Input mutations
              </Link>
            </Tab>
            <Tab style={hideTabOthers ? {display: 'none'} : null}>
              <Link to={`${basePath}/by-sequences/`}>
                Input sequences
              </Link>
            </Tab>
            <Tab style={hideTabReads ? {display: 'none'} : null}>
              <Link to={`${basePath}/by-reads/`}>
                Input sequence reads
              </Link>
            </Tab>
          </TabList>
          <TabPanel>
            <PatternsInputForm
             to={patternsTo}
             {...commonProps} />
          </TabPanel>
          <TabPanel>
            <SequenceInputForm
             to={sequencesTo}
             outputOptions={sequencesOutputOptions}
             {...commonProps} />
          </TabPanel>
          <TabPanel>
            <SequenceReadsInputForm
             to={readsTo}
             outputOptions={seqReadsOutputOptions}
             {...commonProps} />
          </TabPanel>
        </Tabs>}
      {tabName === 'by-reads' || tabName === 'ngs2codfreq' ?
        <NGS2CodFreqForm
         redirectTo={`${basePath}/ngs2codfreq/`}
         analyzeTo={readsTo}
        /> : null}
      {tabName === 'ngs2codfreq' ? ngs2codfreqSide : null}
    </FormsContainer>
  </>;


}

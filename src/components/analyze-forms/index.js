import React from 'react';
import PropTypes from 'prop-types';
import {routerShape, matchShape, Link} from 'found';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';

import FormsContainer from './container';
import PatternsInputForm from './patterns-input-form';
import SequenceInputForm from './sequence-input-form';
import SequenceReadsInputForm from './sequence-reads-input-form';
import NGS2CodFreqForm from './ngs2codfreq-form';


function useCurrentTab(location) {
  return React.useMemo(
    () => {
      const tabName = location.pathname.replace(/\/$/, '').split(/\//);
      return tabName[tabName.length - 1];
    },
    [location.pathname]
  );
}


export function useBasePath(location) {
  return React.useMemo(
    () => {
      const tabName = location.pathname.replace(/\/$/, '').split(/\//);
      return tabName.slice(0, tabName.length - 1).join('/');
    },
    [location.pathname]
  );
}


AnalyzeForms.propTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  onSubmit: PropTypes.func,
  enableTabs: PropTypes.arrayOf(
    PropTypes.oneOf(['patterns', 'sequences', 'reads']).isRequired
  ),
  //onTabSwitch: React.PropTypes.func,
  basePath: PropTypes.string.isRequired,
  patternsTo: PropTypes.string.isRequired,
  sequencesTo: PropTypes.string.isRequired,
  readsTo: PropTypes.string,
  enableReads: PropTypes.bool.isRequired,
  hideReads: PropTypes.bool.isRequired,
  sequencesOutputOptions: PropTypes.object,
  seqReadsOutputOptions: PropTypes.object,
  ngsRunners: PropTypes.object,
  ngs2codfreqSide: PropTypes.node,
  children: PropTypes.node
};

AnalyzeForms.defaultProps = {
  enableTabs: ['patterns', 'sequences', 'reads']
};

export default function AnalyzeForms({
  router,
  match,
  basePath,
  onSubmit,
  children,
  patternsTo,
  sequencesTo,
  readsTo,
  sequencesOutputOptions,
  seqReadsOutputOptions,
  enableTabs,
  ngsRunners,
  ngs2codfreqSide,
  ...otherProps
}) {
  const tabNames = React.useMemo(
    () => enableTabs.map(tab => `by-${tab}`),
    [enableTabs]
  );
  const tabTitles = React.useMemo(
    () => enableTabs.map(tab => ({
      patterns: 'Input mutations',
      sequences: 'Input sequences',
      reads: 'Input sequence reads'
    }[tab])),
    [enableTabs]
  );

  const tabName = useCurrentTab(match.location);
  const tabIndex = tabNames.indexOf(tabName);

  const tabForms = React.useMemo(
    () => enableTabs.map(tab => {
      const commonProps = {...otherProps, onSubmit, children};
      switch (tab) {
        case 'patterns':
          return (
            <PatternsInputForm
             to={patternsTo}
             {...commonProps} />
          );
        case 'sequences':
          return (
            <SequenceInputForm
             to={sequencesTo}
             outputOptions={sequencesOutputOptions}
             {...commonProps} />
          );
        case 'reads':
          return (
            <SequenceReadsInputForm
             to={readsTo}
             outputOptions={seqReadsOutputOptions}
             {...commonProps} />
          );
        default:
          return null;
      }
    }),
    [
      children,
      enableTabs,
      onSubmit,
      otherProps,
      patternsTo,
      readsTo,
      seqReadsOutputOptions,
      sequencesOutputOptions,
      sequencesTo
    ]
  );

  React.useEffect(
    () => {
      if (tabName !== 'ngs2codfreq' && tabIndex < 0) {
        router.replace(`${basePath}/`);
      }
    },
    [basePath, router, tabName, tabIndex]
  );

  return <>
    <FormsContainer>
      {tabName === 'ngs2codfreq' ?
        null :
        <Tabs
         onSelect={() => null}
         selectedIndex={tabIndex}>
          <TabList>
            {tabNames.map((tabName, idx) => (
              <Tab key={tabName}>
                <Link to={`${basePath}/${tabName}/`}>
                  {tabTitles[idx]}
                </Link>
              </Tab>
            ))}
          </TabList>
          {tabForms.map((tabForm, idx) => (
            <TabPanel key={idx}>{tabForm}</TabPanel>
          ))}
        </Tabs>}
      {tabName === 'by-reads' || tabName === 'ngs2codfreq' ?
        <NGS2CodFreqForm
         runners={ngsRunners}
         redirectTo={`${basePath}/ngs2codfreq/`}
         analyzeTo={readsTo}
        /> : null}
      {tabName === 'ngs2codfreq' ? ngs2codfreqSide : null}
    </FormsContainer>
  </>;


}

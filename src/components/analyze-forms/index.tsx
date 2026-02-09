import React from 'react';
import {Link} from 'found';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';

import FormsContainer from './container';
import PatternsInputForm from './patterns-input-form';
import SequenceInputForm from './sequence-input-form';
import SequenceReadsInputForm from './sequence-reads-input-form';
import NGS2CodFreqForm from './ngs2codfreq-form';
import useBasePath from './use-base-path';
import type {AnalyzeFormsProps, AnalyzeTab} from './types';

export type {AnalyzeFormsProps, AnalyzeTab};

/**
 * Extract the name of the active tab from the router location.
 *
 * @param location - Router location object containing the current pathname.
 * @returns The last segment of the pathname which corresponds to the active
 * tab identifier.
 */
function useCurrentTab(location: {pathname: string}): string {
  return React.useMemo(() => {
    const tabName = location.pathname.replace(/\/$/, '').split(/\//);
    return tabName[tabName.length - 1];
  }, [location.pathname]);
}

// useBasePath has been moved to its own module to allow isolated testing

const defaultTabs: AnalyzeTab[] = [
  'patterns',
  'sequences',
  'reads'
];

/**
 * High level container that renders a set of analyze forms within a tabbed
 * interface. Each tab corresponds to a different type of input supported by
 * the application (mutation patterns, sequences or sequence reads).
 *
 * @param props - {@link AnalyzeFormsProps} controlling form tabs.
 * @returns A section containing the tab navigation and the rendered form for
 * the active tab.
 */
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
  enableTabs = defaultTabs,
  ngsRunners,
  ngs2codfreqSide,
  ...otherProps
}: AnalyzeFormsProps): React.ReactElement {
  const tabNames = React.useMemo(
    () => enableTabs.map(tab => `by-${tab}`),
    [enableTabs]
  );
  const tabTitles = React.useMemo(
    () =>
      enableTabs.map(tab => (
        {
          patterns: 'Input mutations',
          sequences: 'Input sequences',
          reads: 'Input sequence reads'
        }[tab]
      )),
    [enableTabs]
  );

  const tabName = useCurrentTab(match.location);
  const tabIndex = tabNames.indexOf(tabName);

  const tabForms = React.useMemo(
    () =>
      enableTabs.map(tab => {
        const commonProps = {...otherProps, onSubmit, children};
        switch (tab) {
          case 'patterns':
            return <PatternsInputForm to={patternsTo} {...commonProps} />;
          case 'sequences':
            return (
              <SequenceInputForm
               to={sequencesTo}
               outputOptions={sequencesOutputOptions ?? {}}
               {...commonProps}
              />
            );
          case 'reads':
            return (
              <SequenceReadsInputForm
               /* `readsTo` is required whenever the reads tab is enabled. */
               to={readsTo!}
               outputOptions={seqReadsOutputOptions ?? {}}
               {...commonProps}
              />
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

  React.useEffect(() => {
    if (tabName !== 'ngs2codfreq' && tabIndex < 0) {
      router.replace(`${basePath}/`);
    }
  }, [basePath, router, tabName, tabIndex]);

  return (
    <FormsContainer tabName={tabName}>
      {tabName === 'ngs2codfreq' ? null : (
        <Tabs onSelect={() => undefined} selectedIndex={tabIndex}>
          <TabList>
            {tabNames.map((name, idx) => (
              <Tab key={name}>
                <Link to={`${basePath}/${name}/`}>{tabTitles[idx]}</Link>
              </Tab>
            ))}
          </TabList>
          {tabForms.map((tabForm, idx) => (
            <TabPanel key={idx}>{tabForm}</TabPanel>
          ))}
        </Tabs>
      )}
      {tabName === 'by-reads' || tabName === 'ngs2codfreq' ? (
        <NGS2CodFreqForm
         showOptionsForm={tabName === 'ngs2codfreq'}
         runners={ngsRunners}
         redirectTo={`${basePath}/ngs2codfreq/`}
         analyzeTo={readsTo}
        />
      ) : null}
      {tabName === 'ngs2codfreq' ? ngs2codfreqSide : null}
    </FormsContainer>
  );
}


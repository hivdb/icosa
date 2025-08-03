import React from 'react';
import {Link} from 'found';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';

import FormsContainer from './container';
import PatternsInputForm from './patterns-input-form';
import SequenceInputForm from './sequence-input-form';
import SequenceReadsInputForm from './sequence-reads-input-form';
import NGS2CodFreqForm from './ngs2codfreq-form';

/**
 * Determine current tab name from location.
 *
 * @param location - Router location object.
 * @returns Last segment of the pathname.
 */
function useCurrentTab(location: {pathname: string}): string {
  return React.useMemo(() => {
    const tabName = location.pathname.replace(/\/$/, '').split(/\//);
    return tabName[tabName.length - 1];
  }, [location.pathname]);
}

/**
 * Compute base path excluding the current tab segment.
 *
 * @param location - Router location object.
 * @returns Pathname prefix before the tab segment.
 */
export function useBasePath(location: {pathname: string}): string {
  return React.useMemo(() => {
    const tabName = location.pathname.replace(/\/$/, '').split(/\//);
    return tabName.slice(0, tabName.length - 1).join('/');
  }, [location.pathname]);
}

export interface AnalyzeFormsProps {
  match: {location: {pathname: string}};
  router: {replace(path: string): void; push(loc: any): void};
  onSubmit?(...args: any[]): Promise<any>;
  enableTabs?: Array<'patterns' | 'sequences' | 'reads'>;
  basePath: string;
  patternsTo: string;
  sequencesTo: string;
  readsTo?: string;
  sequencesOutputOptions?: Record<string, any>;
  seqReadsOutputOptions?: Record<string, any>;
  ngsRunners?: any[];
  ngs2codfreqSide?: React.ReactNode;
  children?: React.ReactNode;
  [key: string]: any;
}

const defaultTabs: Array<'patterns' | 'sequences' | 'reads'> = [
  'patterns',
  'sequences',
  'reads'
];

/**
 * Tabbed container exposing patterns, sequences and sequence reads forms.
 *
 * @param props - {@link AnalyzeFormsProps} controlling form tabs.
 * @returns Container element with tabbed forms.
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
}: AnalyzeFormsProps): JSX.Element {
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
               outputOptions={sequencesOutputOptions}
               {...commonProps}
              />
            );
          case 'reads':
            return (
              <SequenceReadsInputForm
               to={readsTo}
               outputOptions={seqReadsOutputOptions}
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
        <Tabs onSelect={() => null} selectedIndex={tabIndex}>
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


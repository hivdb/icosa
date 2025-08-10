import React, {useState} from 'react';
import classNames from 'classnames';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';

import {H3} from '../../heading-tags';
import CheckboxInput from '../../checkbox-input';
import GenomeMap from '../../genome-map';
import type {Preset} from '../../genome-map/types';
import verticalTabsStyle, {useToggleTabs} from '../../vertical-tabs-style';
import ConfigContext from '../../../utils/config-context';
import createPersistedReducer from '../../../utils/use-persisted-reducer';

import ReportSection from '../report-section';

import {
  getUnsequencedRegions,
  getGenomeMapPositions,
  getCoverages
} from './funcs';
import style from './style.module.scss';

const useViewReducer = createPersistedReducer(
  '--sierra-report-genome-map-view-opt'
);

export interface MutationViewerProps {
  title?: string;
  strain?: string;
  output?: string;
  children?: React.ReactNode;
  defaultView?: "collapse" | "expansion";
  hideViewToggler?: boolean;
  viewCheckboxLabel?: string;
  noUnseqRegions?: boolean;
  regionPresets: any;
  highlightUnusualMutation?: boolean;
  highlightDRM?: boolean;
  defaultPresetIndex?: number;
  allGeneSeqs: Array<{gene:{name:string}; unsequencedRegions?: {regions: Array<{posStart:number; posEnd:number}>}}>;
  coverages?: Array<{gene:string; position:number; coverage:number}>;
  coverageUpperLimit?: number;
}




/**
 * Render genome mutation maps with optional collapse/expansion.
 *
 * @param props - {@link MutationViewerProps} properties controlling display
 * @returns Rendered mutation viewer section
 */
function MutationViewer({
  title = 'Mutation map',
  children,
  defaultView = 'collapse',
  hideViewToggler = false,
  viewCheckboxLabel = 'Collapse mutation maps',
  strain,
  output,
  noUnseqRegions = false,
  defaultPresetIndex = 0,
  regionPresets,
  allGeneSeqs,
  coverages,
  coverageUpperLimit,
  highlightUnusualMutation = true,
  highlightDRM = true
}: MutationViewerProps) {
  const {presets: origPresets, genes} = regionPresets;
  const [selectedIndex, setSelectedIndex] = useState(defaultPresetIndex);
  const [view, toggleView] = useViewReducer(
    v => v === 'expansion' ? 'collapse' : 'expansion',
    defaultView
  );
  const presets = React.useMemo(
    () =>
      origPresets.filter(
        (
          { strainOnly }: { strainOnly?: string[] }
        ) => !strainOnly || strainOnly.includes(strain ?? '')
      ),
    [origPresets, strain]
  );


  interface Payload extends Preset {
    hasCoverage: boolean;
  }

  const payloads: Payload[] = React.useMemo(
    () =>
      presets.map(({
        name: curName,
        highlightGenes,
        preset: { minHeight, regions, ...otherPreset }
      }: {
        name: string;
        highlightGenes?: string[];
        preset: {
          minHeight: number;
          regions: Array<{ posStart: number; posEnd: number }>;
          [key: string]: unknown;
        };
      }) => {
        const presetPosStart = Math.min(
          ...regions.map(({ posStart }: { posStart: number }) => posStart)
        );
        const presetPosEnd = Math.max(
          ...regions.map(({ posEnd }: { posEnd: number }) => posEnd)
        );
        const unseqRegions = noUnseqRegions
          ? []
            : getUnsequencedRegions({
              strain: strain ?? '',
              allGeneSeqs,
              geneDefs: genes,
              knownRegions: regions,
              minPos: presetPosStart,
              maxPos: presetPosEnd
            });
        const positions = getGenomeMapPositions({
          strain: strain ?? '',
          allGeneSeqs,
          geneDefs: genes,
          highlightGenes: highlightGenes ?? [],
          highlightUnusualMutation,
          highlightDRM,
          minPos: presetPosStart,
          maxPos: presetPosEnd
        });
        const unseqPosCount = unseqRegions.reduce(
          (
            acc: number,
            { posStart, posEnd }: { posStart: number; posEnd: number }
          ) =>
            posStart <= presetPosEnd && posEnd >= presetPosStart
              ? acc + 1 + Math.min(posEnd, presetPosEnd) - Math.max(posStart, presetPosStart)
              : acc,
          0
        );
        return {
          name: curName,
          label: '',
          hasCoverage: noUnseqRegions
            ? positions.some(
                ({ pos }: { pos: number }) => pos >= presetPosStart && pos <= presetPosEnd
              )
            : unseqPosCount < 1 + presetPosEnd - presetPosStart,
          ...otherPreset,
          regions: [...regions, ...unseqRegions],
          height: minHeight,
          positionGroups: [
            {
              name: 'NA',
              label: '',
              positions
            }
          ],
          coverages: getCoverages({
            strain: strain ?? '',
            coverages,
            geneDefs: genes,
            minPos: presetPosStart,
            maxPos: presetPosEnd,
            coverageUpperLimit
          })
        } as Payload;
      }),
    [
      strain,
      allGeneSeqs,
      coverageUpperLimit,
      coverages,
      genes,
      noUnseqRegions,
      presets,
      highlightUnusualMutation,
      highlightDRM
    ]
  );

  const showAll = React.useMemo(
    () => payloads.every(({ hasCoverage }: { hasCoverage: boolean }) => !hasCoverage),
    [payloads]
  );

  React.useEffect(
    () => {
      if (!showAll && !payloads[selectedIndex].hasCoverage) {
        setSelectedIndex(
          payloads.findIndex(({ hasCoverage }: { hasCoverage: boolean }) => hasCoverage)
        );
      }
    },
    [showAll, payloads, selectedIndex]
  );

  const [tabsExpanded, togglerNode, resetExpansion] = useToggleTabs();

  const handleSelect = React.useCallback(
    (idx: number) => {
      resetExpansion();
      setSelectedIndex(idx);
    },
    [resetExpansion, setSelectedIndex]
  );

  return (
    <ReportSection
     title={title}
     titleAnnotation={output === 'printable' || hideViewToggler ?
       null :
       <CheckboxInput
        id="genome-map-view"
        name="genome-map-view"
        className={style['genome-map-view-checkbox']}
        value="collapse"
        onChange={toggleView}
        checked={view === 'collapse'}>
         {viewCheckboxLabel}
       </CheckboxInput>}
    >
      {output !== 'printable' && view === 'collapse' ?
        <Tabs
         data-tabs-expanded={tabsExpanded}
         className={classNames(
           style['sierra-genome-map-tabs'],
           verticalTabsStyle['vertical-tabs']
         )}
         onSelect={handleSelect}
         selectedIndex={selectedIndex}>
          <TabList>
            {presets.map((
              {name, label}: {name: string; label: string},
              idx: number
            ) => (
              <Tab
               data-hide={!showAll && !payloads[idx].hasCoverage}
               key={`tab-${name}`}>{label} ({name})</Tab>
            ))}
          </TabList>
          {togglerNode}
          {payloads.map((payload: Payload) => (
            <TabPanel
             data-hide={!showAll && !payload.hasCoverage}
             key={`tabpanel-${payload.name}`}>
              <GenomeMap
               key={`genome-map-${payload.name}`}
               preset={payload}
               className={style['sierra-genome-map']} />
            </TabPanel>
          ))}
        </Tabs> :
        presets.map(
          (
            {name, label}: {name: string; label: string},
            idx: number
          ) => (
          <section
           key={`section=${name}`}
           data-hide={!showAll && !payloads[idx].hasCoverage}
           className={style['genome-map-expanded']}>
            <H3 disableAnchor>{label} ({name})</H3>
            <GenomeMap
             key={`genome-map-${name}`}
             preset={payloads[idx]}
             className={style['sierra-genome-map']} />
          </section>
        ))}
      {children}
    </ReportSection>
  );
}


/**
 * Loader component that injects configuration context into MutationViewer.
 *
 * @param props - {@link MutationViewerProps} without context-supplied fields
 * @returns MutationViewer component wrapped with context values
 */
export default function MutationViewerLoader(props: Omit<MutationViewerProps, 'regionPresets' | 'hideViewToggler' | 'highlightUnusualMutation' | 'highlightDRM'>) {

  return <ConfigContext.Consumer>
    {({
      regionPresets,
      hideMutationViewToggler: hideViewToggler,
      highlightUnusualMutation,
      highlightDRM
    }) => (
      <MutationViewer
       {...props}
       {...{
         regionPresets,
         hideViewToggler,
         highlightUnusualMutation,
         highlightDRM
       }} />
    )}
  </ConfigContext.Consumer>;
}

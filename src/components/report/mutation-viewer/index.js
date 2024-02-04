import React, {useState} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';

import {H3} from '../../heading-tags';
import CheckboxInput from '../../checkbox-input';
import GenomeMap from '../../genome-map';
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


MutationViewer.propTypes = {
  title: PropTypes.string.isRequired,
  strain: PropTypes.string,
  output: PropTypes.string,
  children: PropTypes.node,
  defaultView: PropTypes.oneOf(['collapse', 'expansion']).isRequired,
  hideViewToggler: PropTypes.bool,
  viewCheckboxLabel: PropTypes.string.isRequired,
  noUnseqRegions: PropTypes.bool.isRequired,
  regionPresets: PropTypes.object.isRequired,
  highlightUnusualMutation: PropTypes.bool,
  highlightDRM: PropTypes.bool,
  defaultPresetIndex: PropTypes.number.isRequired,
  allGeneSeqs: PropTypes.arrayOf(
    PropTypes.shape({
      gene: PropTypes.shape({
        name: PropTypes.string.isRequired
      }).isRequired,
      unsequencedRegions: PropTypes.shape({
        regions: PropTypes.arrayOf(
          PropTypes.shape({
            posStart: PropTypes.number.isRequired,
            posEnd: PropTypes.number.isRequired
          }).isRequired
        ).isRequired
      })
    }).isRequired
  ).isRequired,
  coverages: PropTypes.arrayOf(
    PropTypes.shape({
      gene: PropTypes.string.isRequired,
      position: PropTypes.number.isRequired,
      coverage: PropTypes.number.isRequired
    }).isRequired
  ),
  coverageUpperLimit: PropTypes.number
};


MutationViewer.defaultProps = {
  title: 'Mutation map',
  noUnseqRegions: false,
  defaultView: 'collapse',
  hideViewToggler: false,
  viewCheckboxLabel: 'Collapse mutation maps',
  defaultPresetIndex: 0,
  highlightUnusualMutation: true,
  highlightDRM: true
};


function MutationViewer({
  title,
  children,
  defaultView,
  hideViewToggler,
  viewCheckboxLabel,
  strain,
  output,
  noUnseqRegions,
  defaultPresetIndex,
  regionPresets,
  allGeneSeqs,
  coverages,
  coverageUpperLimit,
  highlightUnusualMutation,
  highlightDRM
}) {
  const {presets: origPresets, genes} = regionPresets;
  const [selectedIndex, setSelectedIndex] = useState(defaultPresetIndex);
  const [view, toggleView] = useViewReducer(
    v => v === 'expansion' ? 'collapse' : 'expansion',
    defaultView
  );
  const presets = React.useMemo(
    () => origPresets.filter(
      ({strainOnly}) => !strainOnly || strainOnly.includes(strain)
    ),
    [origPresets, strain]
  );


  const payloads = React.useMemo(
    () => presets.map(({
      name: curName,
      highlightGenes,
      preset: {minHeight, regions, ...otherPreset}
    }) => {
      const presetPosStart = Math.min(...regions.map(({posStart}) => posStart));
      const presetPosEnd = Math.max(...regions.map(({posEnd}) => posEnd));
      const unseqRegions = (
        noUnseqRegions ? [] :
          getUnsequencedRegions({
            strain,
            allGeneSeqs,
            geneDefs: genes,
            knownRegions: regions,
            minPos: presetPosStart,
            maxPos: presetPosEnd
          })
      );
      const positions = getGenomeMapPositions({
        strain,
        allGeneSeqs,
        geneDefs: genes,
        highlightGenes,
        highlightUnusualMutation,
        highlightDRM,
        minPos: presetPosStart,
        maxPos: presetPosEnd
      });
      const unseqPosCount = unseqRegions.reduce(
        (acc, {posStart, posEnd}) => (
          (posStart <= presetPosEnd && posEnd >= presetPosStart) ? (
            acc + 1 +
            Math.min(posEnd, presetPosEnd) -
            Math.max(posStart, presetPosStart)
          ) : acc
        ),
        0
      );
      return {
        name: curName,
        label: '',
        hasCoverage: noUnseqRegions ?
          positions.some(({pos}) => (
            pos >= presetPosStart && pos <= presetPosEnd
          )) :
          unseqPosCount < 1 + presetPosEnd - presetPosStart,
        ...otherPreset,
        regions: [
          ...regions,
          ...unseqRegions
        ],
        height: minHeight,
        positionGroups: [{
          name: 'NA',
          label: '',
          positions
        }],
        coverages: getCoverages({
          strain,
          coverages,
          geneDefs: genes,
          minPos: presetPosStart,
          maxPos: presetPosEnd,
          coverageUpperLimit
        })
      };
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
    () => payloads.every(({hasCoverage}) => !hasCoverage),
    [payloads]
  );

  React.useEffect(
    () => {
      if (!showAll && !payloads[selectedIndex].hasCoverage) {
        setSelectedIndex(payloads.findIndex(({hasCoverage}) => hasCoverage));
      }
    },
    [showAll, payloads, selectedIndex]
  );

  const [tabsExpanded, togglerNode, resetExpansion] = useToggleTabs();

  const handleSelect = React.useCallback(
    idx => {
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
            {presets.map(({name, label}, idx) => (
              <Tab
               data-hide={!showAll && !payloads[idx].hasCoverage}
               key={`tab-${name}`}>{label} ({name})</Tab>
            ))}
          </TabList>
          {togglerNode}
          {payloads.map(payload => (
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
        presets.map(({name, label}, idx) => (
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


export default function MutationViewerLoader(props) {

  return <ConfigContext.Consumer>
    {({
      regionPresets,
      highlightUnusualMutation,
      highlightDRM
    }) => (
      <MutationViewer
       {...props}
       {...{
         regionPresets,
         highlightUnusualMutation,
         highlightDRM
       }} />
    )}
  </ConfigContext.Consumer>;
}

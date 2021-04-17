import React from 'react';
import PropTypes from 'prop-types';
import {routerShape, matchShape, Link} from 'found';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';

import FormsContainer from './container';
import PatternsInputForm from './patterns-input-form';
import SequenceInputForm from './sequence-input-form';
import SequenceReadsInputForm from './sequence-reads-input-form';


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


export default class AnalyzeForms extends React.Component {

  static propTypes = {
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
    children: PropTypes.node
  }

  static defaultProps = {
    enableReads: false,
    hideReads: false
  }

  getTabIndex(loc = this.props.match.location) {
    const tabName = getCurrentTab(loc);
    return tabIndice[tabName] || 0;
  }

  render() {
    const {
      basePath, onSubmit, children,
      enableReads, hideReads, ...otherProps
    } = this.props;
    const commonProps = {...otherProps, onSubmit, children};
    const isCurTabSeqReads = this.getTabIndex() === 2;
    const hideTabOthers = enableReads && hideReads && isCurTabSeqReads;
    const hideTabReads = !enableReads && !hideReads;

    return (
      <FormsContainer>
        <Tabs
         onSelect={() => null}
         selectedIndex={this.getTabIndex()}>
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
             to={this.props.patternsTo}
             {...commonProps} />
          </TabPanel>
          <TabPanel>
            <SequenceInputForm
             to={this.props.sequencesTo}
             outputOptions={this.props.sequencesOutputOptions}
             {...commonProps} />
          </TabPanel>
          <TabPanel>
            <SequenceReadsInputForm
             to={this.props.readsTo}
             outputOptions={this.props.seqReadsOutputOptions}
             {...commonProps} />
          </TabPanel>
        </Tabs>
      </FormsContainer>
    );
  }

}

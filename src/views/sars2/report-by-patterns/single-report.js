import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';

import {
  MutationViewer as MutViewer,
  ReportSection,
  MutationList as MutList
} from '../../../components/report';

import AntibodySuscSummary from '../../../components/ab-susc-summary';

import style from '../style.module.scss';


function HLFirstWord({children, index}) {
  children = children.split(' ');
  return <>
    <h1>{index + 1}. {children[0]}</h1>
    {children.length > 1 ? (
      <p className={style.desc}>{children.slice(1).join(' ')}</p>
    ) : null}
  </>;
}


function scrollTo(top, callback, smoothMaxDelta = 0) {
  const enableSmooth = Math.abs(top - window.pageYOffset) < smoothMaxDelta;
  const checkScroll = () => {
    if (Math.abs(window.pageYOffset - top) < 15) {
      window.removeEventListener('scroll', checkScroll, false);
      document.documentElement.dataset.noSmoothScroll = '';
      setTimeout(() => {
        window.scrollTo({top, behavior: 'auto'});
        callback && setTimeout(callback, 500);
      }, 50);
      delete document.documentElement.dataset.noSmoothScroll;
    }
  };
  window.addEventListener('scroll', checkScroll, false);
  let behavior = 'auto';
  if (enableSmooth) {
    behavior = 'smooth';
  }
  else {
    // disable global smooth scroll
    document.documentElement.dataset.noSmoothScroll = '';
  }
  window.scrollTo({top, behavior});
}


export default class SinglePatternReport extends React.Component {

  static propTypes = {
    currentSelected: PropTypes.object,
    onSelect: PropTypes.func.isRequired,
    species: PropTypes.string,
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    patternResult: PropTypes.object.isRequired,
    output: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    onObserve: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.headerRef = React.createRef();
  }

  resetScroll = (curName) => {
    let callback = null;
    if (curName.detail) {
      callback = curName.detail.callback;
      curName = curName.detail.name;
    }
    const {
      patternResult: {name}
    } = this.props;
    if (name === curName) {
      const headerNode = this.headerRef.current;
      let {top} = headerNode.getBoundingClientRect();
      top += window.pageYOffset - 150;
      scrollTo(top, callback);
    }
  }

  shouldComponentUpdate(nextProps) {
    const {
      patternResult: {name: prevName}
    } = this.props;
    const {
      patternResult: {name: nextName}
    } = nextProps;
    return prevName !== nextName;
  }

  componentDidMount() {
    const {
      output,
      currentSelected: {name: curName} = {},
      onObserve
    } = this.props;
    if (output === 'printable') {
      return;
    }
    const headerNode = this.headerRef.current;
    onObserve(headerNode);
    this.resetScroll(curName);
    window.addEventListener(
      '--sierra-report-reset-scroll',
      this.resetScroll,
      false
    );
  }

  componentWillUnmount() {
    const {output} = this.props;
    if (output === 'printable') {
      return;
    }
    window.removeEventListener(
      '--sierra-report-reset-scroll',
      this.resetScroll,
      false
    );
  }

  render() {
    const {
      // inputPattern,
      patternResult,
      patternResult: {
        name: patName,
        allGeneMutations
      },
      output,
      index
    } = this.props;

    return (
      <article
       key={patName}
       className={style['pattern-article']}>
        <header
         data-pattern-name={patName}
         data-pattern-index={index}
         ref={this.headerRef}
         className={style['pattern-header']} id={patName}>
          <HLFirstWord index={index}>{patName}</HLFirstWord>
        </header>
        <ReportSection title="Sequence quality assessment">
          <MutViewer noUnseqRegions {...{
            allGeneSeqs: allGeneMutations,
            output
          }} />
        </ReportSection>
        <ReportSection title="Mutation list">
          <MutList {...patternResult} {...{output}} />
        </ReportSection>
        <ReportSection title="MAb susceptibility summary">
          <AntibodySuscSummary {...patternResult} {...{output}} />
        </ReportSection>
      </article>
    );
  }


}

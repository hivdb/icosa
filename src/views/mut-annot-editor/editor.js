import React from 'react';
import PropTypes from 'prop-types';

import SequenceViewer from './components/sequence-viewer';
import EditorController from './components/editor-controller';
import style from './style.module.scss';

import PromiseComponent from '../../utils/promise-component';


class MutAnnotEditorInner extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    display: PropTypes.node.isRequired,
    refSeq: PropTypes.string.isRequired,
    annotationData: PropTypes.object.isRequired
  }

  constructor() {
    super(...arguments);
    const {
      annotations,
      positions,
      citations
    } = this.props.annotationData;
    this.state = {
      annotations: [...annotations],
      positions: [...positions],
      citations: {...citations},
      curAnnot: annotations[0] || null,
      selectedPositions: []
    };
  }

  handlePositionsSelect = (selectedPositions) => {
    this.setState({selectedPositions});
  }

  handleAnnotChange = (curAnnot) => {
    this.setState({curAnnot});
  };

  render() {
    const {
      refSeq,
      annotationData
    } = this.props;
    const {
      annotations,
      positions,
      citations,
      selectedPositions,
      curAnnot
    } = this.state;

    return <section className={style.editor}>
      <SequenceViewer
       sequence={refSeq}
       curAnnot={curAnnot}
       positions={positions}
       citations={citations}
       selectedPositions={selectedPositions}
       onChange={this.handlePositionsSelect}
       className={style.seqviewer} />
      <div className={style['controller-container']}>
        <EditorController
         annotations={annotations}
         annotation={curAnnot}
         onAnnotationChange={this.handleAnnotChange}
         className={style['controller']} />
        <pre>
          {JSON.stringify(annotationData, null, '  ')}
        </pre>
      </div>
    </section>;
  }
}


export default class MutAnnotEditor extends React.Component {

  static propTypes = {
    preset: PropTypes.shape({
      name: PropTypes.string.isRequired,
      display: PropTypes.node.isRequired,
      refSeqLoader: PropTypes.func.isRequired,
      annotationLoader: PropTypes.func.isRequired
    }).isRequired
  }

  static getDerivedStateFromProps(props, state) {
    const {name, display, refSeqLoader, annotationLoader} = props.preset;
    if (
      state.refSeqLoader === refSeqLoader &&
      state.annotationLoader === annotationLoader
    ) {
      return null;
    }
    return {
      refSeqLoader,
      annotationLoader,
      promise: (async () => ({
        name, display,
        refSeq: await refSeqLoader(),
        annotationData: await annotationLoader()
      }))()
    };
  }

  constructor() {
    super(...arguments);
    this.state = this.constructor.getDerivedStateFromProps(this.props, {});
  }

  render() {
    const {promise} = this.state;
    return (
      <PromiseComponent
       promise={promise}
       component={MutAnnotEditorInner} />
    );
  }

}

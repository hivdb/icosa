import React from 'react';
import PropTypes from 'prop-types';

import GeneChart from './gene-chart';
import AutofitGraph from '../autofit';


export default class SeqReadsAnalysisQAChart extends React.Component {

  static propTypes = {
    allGeneSequenceReads: PropTypes.array.isRequired,
    output: PropTypes.string.isRequired
  }

  static defaultProps = {
    output: 'default'
  }

  constructor() {
    super(...arguments);
    this.state = {width: this.props.output === 'printable' ? 8 * 72 : 0};
  }

  handleResize = ({width}) => {
    this.setState({width});
  }

  render() {
    const {allGeneSequenceReads, output} = this.props;
    const {width} = this.state;

    return <AutofitGraph output={output} onResize={this.handleResize}>
      <h2>
        Sequence Reads Quality Assessment
      </h2>
      {allGeneSequenceReads.map((props, idx) => (
        <GeneChart
         key={idx} containerWidth={width}
         frameShifts={[]} {...props} />
      ))}
    </AutofitGraph>;
  }

}

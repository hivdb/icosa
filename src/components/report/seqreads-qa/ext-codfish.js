import React from 'react';
import PropTypes from 'prop-types';
import {FaDownload, FaEye, FaEyeSlash} from 'react-icons/fa';


import Button from '../../button';
import {makeDownload} from '../../../utils/download';

import CodfishGraph from './codfish-graph';
import style from './style.module.scss';


function prepareData(allGeneSequenceReads) {
  let rows = [];
  for (const geneSeqReads of allGeneSequenceReads) {
    const {gene: {name: gene}} = geneSeqReads;
    const allPositionCodonReads = JSON.parse(
      geneSeqReads.internalJsonAllPositionCodonReads
    );
    for (const posCodons of allPositionCodonReads) {
      const {position: pos, totalReads: total} = posCodons;
      for (const scr of posCodons.codonReads) {
        const {
          refAminoAcid: ref, aminoAcid: aa,
          codon: cd, reads, aaPercent: aaPcnt,
          proportion: pcnt
        } = scr;
        rows.push({
          gene, pos, total, cd, count: reads, ref, aa,
          pcnt, aaPcnt, cdPcnt: scr.codonPercent,
          isDRM: scr.isDRM,
          isUnusual: scr.isUnusual,
          isApobecMutation: scr.isApobecMutation,
          isApobecDRM: scr.isApobecDRM
        });
      }
    }
  }
  rows = rows.sort((a, b) => b.pcnt - a.pcnt);
  let accumScore = 0;
  for (const row of rows) {
    accumScore += row.cdPcnt > 0 ? Math.log10(row.cdPcnt * 100) : -4;
    row.accumScore = accumScore;
  }
  return rows;
}


function prepareOutput(extCodfish) {
  const header = [
    'Gene', 'Position', 'Total', 'Codon', 'Count', 'AA',
    'ReadsPercent', 'HIVDBAAPcnt', 'HIVDBCodonPcnt', 'IsDRM',
    'IsUnusual', 'IsApobecMutation', 'IsApobecDRM'
  ].join(',');
  const rows = extCodfish.map(r => [
    r.gene, r.pos, r.total, r.cd, r.count, r.aa,
    `${r.pcnt * 100}%`, `${r.aaPcnt * 100}%`, `${r.cdPcnt * 100}%`,
    r.isDRM ? 'Yes': '',
    r.isUnusual ? 'Yes': '',
    r.isApobecMutation ? 'Yes': '',
    r.isApobecDRM ? 'Yes': ''
  ].join(',')).join('\n');
  return `${header}\n${rows}`;
}

class ExtCodfishDownload extends React.Component {

  static propTypes = {
    name: PropTypes.string.isRequired,
    extCodfish: PropTypes.array.isRequired,
    onFinish: PropTypes.func.isRequired
  }

  static defaultProps = {
    onFinish: () => null
  }

  render() {
    const {name, extCodfish} = this.props;
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this._timeout = setTimeout(() => {
      makeDownload(
        `${name}.ext.csv`, "text/csv",
        prepareOutput(extCodfish));
      this.props.onFinish();
    }, 200);
    return null;
  }

}


export default class ExtCodfish extends React.Component {

  constructor() {
    super(...arguments);
    this.state = {downloading: false, showChart: false};
  }

  handleDownload = () => {
    this.setState({downloading: true});
  }

  handleDownloadFinish = () => {
    this.setState({downloading: false});
  }

  toggle = () => {
    this.setState({showChart: !this.state.showChart});
  }

  render() {
    const {downloading, showChart} = this.state;
    const {name, allGeneSequenceReads} = this.props;
    const extCodfish = prepareData(allGeneSequenceReads);
    return <div className={style['ext-codfish-container']} data-hide={!showChart}>
      <div>
        <CodfishGraph {...{extCodfish}} />
        <br />
        {downloading ?
          <ExtCodfishDownload
           {...{name, extCodfish}}
           onFinish={this.handleDownloadFinish} /> : null}
        <div className={style.buttons}>
          <Button
           btnSize="small"
           disabled={downloading}
           className={style.button}
           btnStyle="info"
           onClick={this.handleDownload}>
            <FaDownload className={style['icon-before-text']} />
            {' '}Spreadsheet
          </Button>
          <Button
           btnSize="small"
           onClick={this.toggle}>
            {showChart ?
              <FaEyeSlash className={style['icon-before-text']} /> :
              <FaEye className={style['icon-before-text']} />
            }{' '}
            Graph
          </Button>
        </div>
      </div>
    </div>;
  }

}

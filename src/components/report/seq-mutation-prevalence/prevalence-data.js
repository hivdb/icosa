import React from 'react';
import PropTypes from 'prop-types';
import '../../../styles/griddle-table.scss';

import {parseMutation} from '../../../utils/mutation';
import Link from '../../link';

import {geneToDrugClass} from './common';


export default class PrevalenceData extends React.Component {

  static propTypes = {
    data: PropTypes.string.isRequired,
    rowData: PropTypes.object.isRequired,
    metadata: PropTypes.object.isRequired
  };

  static contextTypes = {
    gene: PropTypes.string.isRequired
  };

  renderPercentage(pcnt) {
    if (pcnt >= 1) {
      return Math.round(pcnt);
    }
    else if (pcnt > 0) {
      return pcnt;
    }
    else {
      return '\xa0';
    }
  }

  handleLinkClick = (e) => {
    e.stopPropagation();
  };

  render() {
    let subtype, rx;
    const {data, rowData, metadata} = this.props;
    const {columnName} = metadata;
    const {mutation} = rowData;
    const drugClass = geneToDrugClass[this.context.gene];
    let [pos,, cons] = parseMutation(mutation);

    if (columnName.startsWith("naive")) {
      subtype = columnName.slice(5);
      rx = `${drugClass}_Naive`;
    }
    else { // startsWith("treated")
      subtype = columnName.slice(7);
      rx = drugClass;
    }

    const urlBase = (
      "/cgi-bin/GetIsolateDataResiSubtype.cgi?" +
      `class=${drugClass}&subtype=${subtype}&rx=${rx}&includeMixtures=No&`);

    return (
      <div>
        {(() => data
          .map(([aa, pcnt], idx) => {
            const isZero = parseInt(pcnt, 10) === 0;
            pcnt = this.renderPercentage(pcnt);
            if (aa === cons) {
              return null;
            }
            aa = aa
              .replace('Deletion', 'del')
              .replace('Insertion', 'ins');
            return (
              <div key={idx}>
                {isZero ? '\xa0' :
                <Link
                 target="_blank"
                 onClick={this.handleLinkClick}
                 href={`${urlBase}&pos=${pos}&cons=${cons}&aa=${aa}`}
                 title={aa}>
                  {pcnt}
                </Link>}
              </div>
            );
          })
        )()}
      </div>
    );
  }

}

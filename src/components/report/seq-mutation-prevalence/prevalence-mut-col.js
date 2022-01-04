import React from 'react';
import PropTypes from 'prop-types';
import '../../../styles/griddle-table.scss';
import {FaRegPlusSquare} from '@react-icons/all-files/fa/FaRegPlusSquare';
import {FaRegMinusSquare} from '@react-icons/all-files/fa/FaRegMinusSquare';
import {parseMutation} from '../../../utils/mutation';
import style from '../style.module.scss';

export default class PrevalenceMutCol extends React.Component {

  static propTypes = {
    data: PropTypes.string.isRequired,
    rowData: PropTypes.object.isRequired
  }

  static contextTypes = {
    expandedRows: PropTypes.object.isRequired
  }

  render() {
    let {data, rowData} = this.props;
    data = data.replace('Deletion', 'del').replace('Insertion', 'ins');
    let [pos, aas, cons] = parseMutation(data);
    const consPosLen = 1 + pos.toString().length;
    const spaces = '      '.slice(0, consPosLen);
    const isParent = 'children' in rowData;
    const isIndel = /^(ins|del)$|-|_/.test(aas);
    if (aas.indexOf('-') > -1) { aas = 'del'; }
    else if (aas.indexOf('_') > -1) { aas = 'ins'; }
    if (isParent) {
      const expanded = this.context.expandedRows.has(rowData.__index__);
      const Icon = expanded ? FaRegMinusSquare : FaRegPlusSquare;
      if (
        isIndel || aas.length === 1 ||
        (aas.indexOf(cons) > -1 && aas.length === 2)
      ) {
        return <span>
          <Icon className={style['expand-btn']} />
          {cons}{pos}{aas}
        </span>;
      }
      else { // aas.length > 2 or no-cons mixture
        let display = [];
        let aaList = new Array(...aas.replace(cons, ''));
        const consPrefix = aas.length === aaList.length ? '' : cons;
        const firstAA = aaList.shift();
        display.push(`${cons}${pos}${consPrefix}${firstAA}`);
        for (let aa of aaList) {
          display.push(<br key={aa} />);
          display.push(`${spaces}${aa}`);
        }
        return <span>
          <Icon className={style['expand-btn']} />
          <span className={style['mixture-mut']}>{display}</span>
        </span>;
      }
    }
    else {
      return <span>{`${spaces}${aas}`}</span>;
    }
  }
}

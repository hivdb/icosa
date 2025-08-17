import React from 'react';
import '../../../styles/griddle-table.scss';
import {FaRegPlusSquare} from '@react-icons/all-files/fa/FaRegPlusSquare';
import {FaRegMinusSquare} from '@react-icons/all-files/fa/FaRegMinusSquare';
import {parseMutation} from '../../../utils/mutation';
import style from '../style.module.scss';

/**
 * Column renderer for mutation names with expand/collapse icons.
 *
 * @param mutation - Mutation text.
 * @param row - Table row containing data and state.
 * @returns Span element with formatted mutation text.
 */
export interface PrevalenceMutColProps {
  mutation: string;
  row: any;
}

export default function PrevalenceMutCol({
  mutation,
  row
}: PrevalenceMutColProps) {
  const [pos, aasRaw, consRaw] = parseMutation(
    mutation
      .replace('Deletion', 'del')
      .replace('Insertion', 'ins')
  );
  const posNum = pos ? Number(pos) : 0;
  let aas = aasRaw ?? '';
  const cons = consRaw ?? '';
  const consPosLen = 1 + posNum.toString().length;
  const spaces = '      '.slice(0, consPosLen);
  const isParent = 'children' in row;
  const isIndel = /^(ins|del)$|-|_/.test(aas);
  if (aas.indexOf('-') > -1) { aas = 'del'; }
  else if (aas.indexOf('_') > -1) { aas = 'ins'; }
  if (isParent) {
    const expanded = row.showChildren;
    const Icon = expanded ? FaRegMinusSquare : FaRegPlusSquare;
    if (
      isIndel || aas.length === 1 ||
      (aas.indexOf(cons) > -1 && aas.length === 2)
    ) {
      return <span>
        <Icon className={style['expand-btn']} />
        {cons}{posNum}{aas}
      </span>;
    }
    else { // aas.length > 2 or no-cons mixture
      let display: any[] = [];
      let aaList = new Array(...aas.replace(cons, ''));
      const consPrefix = aas.length === aaList.length ? '' : cons;
      const firstAA = aaList.shift();
      display.push(`${cons}${posNum}${consPrefix}${firstAA}`);
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

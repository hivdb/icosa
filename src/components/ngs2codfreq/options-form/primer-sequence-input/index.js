import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import ItemInput from './item-input';
import Button from '../../../button';
import {primerSeqShape} from '../prop-types';
import style from '../style.module.scss';


PrimerSequenceInput.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.arrayOf(
    primerSeqShape.isRequired
  ).isRequired,
  onChange: PropTypes.func.isRequired
};


export default function PrimerSequenceInput({
  name,
  value,
  onChange
}) {
  const [autoIncr, setAutoIncr] = React.useState(
    value.length > 0 ? Math.max(
      ...value.map(({idx}) => idx)
    ) + 1 : 0
  );
  const [pendingItems, setPendingItems] = React.useState([]);
  const [errors, setErrors] = React.useState([]);

  React.useEffect(
    () => {
      const newErrors = [];
      const headerCounter = {};
      const seqCounter = {};
      for (const {header, sequence: seq} of value) {
        if (header in headerCounter) {
          if (headerCounter[header] === 1) {
            newErrors.push(<>
              Error: Duplicate headers <strong>{header}</strong>
            </>);
          }
          headerCounter[header] ++;
        }
        else {
          headerCounter[header] = 1;
        }
        if (seq in seqCounter) {
          if (seqCounter[seq] === 1) {
            newErrors.push(<>
              Error: Duplicate primer sequences <strong>{seq}</strong>
            </>);
          }
          seqCounter[seq] ++;
        }
        else {
          seqCounter[seq] = 1;
        }
      }
      setErrors(newErrors);
    },
    [value]
  );

  const handleChange = React.useCallback(
    (item, isNew, isRemove = false) => {
      const newValue = [...value];
      if (isNew) {
        if (!isRemove) {
          // add a new item
          newValue.push(item);
        }
        // remove the pending item
        const newPendingItems = [...pendingItems];
        newPendingItems.splice(
          newPendingItems.findIndex(({idx}) => idx === item.idx),
          1
        );
        setPendingItems(newPendingItems);
      }
      else {
        const idx = newValue.findIndex(({idx}) => idx === item.idx);
        if (isRemove) {
          // remove an item
          newValue.splice(idx, 1);
        }
        else {
          // replace an item
          newValue[idx] = item;
        }
      }
      onChange(name, newValue);
    },
    [pendingItems, name, value, onChange]
  );

  const handleReset = React.useCallback(
    () => {
      setAutoIncr(0);
      setPendingItems([]);
      onChange(name, []);
    },
    [name, onChange]
  );

  const handleAddNew = React.useCallback(
    () => {
      const newPendingItems = [...pendingItems, {
        idx: autoIncr,
        header: `Primer-${autoIncr + 1}`,
        sequence: '',
        type: 'both-end'
      }];
      setAutoIncr(autoIncr + 1);
      setPendingItems(newPendingItems);
    },
    [pendingItems, autoIncr]
  );

  return <>
    {errors ? <ul className={style['fielderrors']}>
      {errors.map((error, idx) => <li key={idx}>{error}</li>)}
    </ul> : null}
    {value.map(
      item => (
        <ItemInput
         key={`primer-sequence-${item.idx}`}
         name={name}
         value={item}
         onChange={handleChange} />
      )
    )}
    {pendingItems.map(
      item => (
        <ItemInput
         isNew
         key={`primer-sequence-${item.idx}`}
         name={name}
         value={item}
         onChange={handleChange} />
      )
    )}
    <div className={style['fieldrow']}>
      <div className={style['fieldlabel']} />
      <div className={classNames(
        style['fieldinput'],
        style['primer-sequence-buttons']
      )}>
        <Button
         btnStyle="primary"
         onClick={handleAddNew}>
          {value.length + pendingItems.length === 0 ?
            'Add one primer' : 'Add more primer'}
        </Button>
        <Button
         btnStyle="light"
         onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  </>;
}

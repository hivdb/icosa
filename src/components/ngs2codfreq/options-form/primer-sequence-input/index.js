import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Button from '../../../button';
import FileInput from '../../../file-input';
import {primerSeqShape} from '../prop-types';
import {parseFasta} from '../../../../utils/fasta';
import readFile from '../../../../utils/read-file';

import ItemInput from './item-input';
import useValidation from './use-validation';
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
  const mounted = React.useRef(false);
  const [autoIncr, setAutoIncr] = React.useState(
    value.length > 0 ? Math.max(
      ...value.map(({idx}) => idx)
    ) + 1 : 0
  );
  const [pendingItems, setPendingItems] = React.useState([]);
  const errors = useValidation(value);

  React.useEffect(
    () => {
      mounted.current = true;
      return () => mounted.current = false;
    },
    []
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
      if (window.confirm(
        'This operation will irrecoverably remove all primer ' +
        'sequences. Please confirm:'
      )) {
        setAutoIncr(0);
        setPendingItems([]);
        onChange(name, []);
      }
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

  const handleUpload = React.useCallback(
    async files => {
      const newItems = [];
      let newAutoIncr = autoIncr;
      for (const file of files) {
        if (
          !file ||
          !(/^text\/.+$|^application\/x-gzip$|^$/.test(file.type))
        ) {
          continue;
        }
        const rawFasta = await readFile(file);
        for (const {header, sequence} of parseFasta(rawFasta, file.name)) {
          newItems.push({
            idx: newAutoIncr ++,
            header,
            sequence,
            type: 'both-end'
          });
        }
      }

      if (!mounted.current) {
        return;
      }
      onChange(name, [...value, ...newItems]);
      setAutoIncr(newAutoIncr);
    },
    [onChange, autoIncr, name, value]
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
        <FileInput
         multiple
         hideSelected
         btnStyle="info"
         accept=".fasta,.fas,.fa,.txt,.gz"
         onChange={handleUpload}>
          Upload FASTA
        </FileInput>
        <span className={style.or}> or </span>
        <Button
         btnStyle="primary"
         onClick={handleAddNew}>
          {value.length + pendingItems.length === 0 ?
            'Add one primer' : 'Add more primer'}
        </Button>
        <Button
         disabled={value.length + pendingItems.length === 0}
         btnStyle="light"
         onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  </>;
}

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ConfigContext from '../../../../utils/config-context';
import {useCMS} from '../../../../utils/cms';

import Button from '../../../button';
import FileInput from '../../../file-input';
import InlineLoader from '../../../inline-loader';
import {primerBedShape} from '../prop-types';
import {parseFasta} from '../../../../utils/fasta';
import readFile from '../../../../utils/read-file';

import ItemInput from './item-input';
import useValidation from './use-validation';
import style from '../style.module.scss';


PrimerLocationInput.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.arrayOf(
    primerBedShape.isRequired
  ).isRequired,
  onChange: PropTypes.func.isRequired
};


export default function PrimerLocationInput({
  name,
  value,
  onChange
}) {
  const [config] = ConfigContext.use();
  const mounted = React.useRef(false);
  const [autoIncr, setAutoIncr] = React.useState(
    value.length > 0 ? Math.max(
      ...value.map(({idx}) => idx)
    ) + 1 : 0
  );
  const [pendingItems, setPendingItems] = React.useState([]);

  React.useEffect(
    () => {
      mounted.current = true;
      return () => mounted.current = false;
    },
    []
  );

  const [
    refSequenceText,
    isRefSeqPending
  ] = useCMS(config.refSequencePath, config);

  const refSequence = React.useMemo(
    () => isRefSeqPending ?
      null : parseFasta(refSequenceText, 'ref')[0].sequence,
    [refSequenceText, isRefSeqPending]
  );

  const errors = useValidation(value, refSequence);

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
        region: config.refSequenceName || '<Unknown>',
        start: -1,
        end: -1,
        name: `Primer-${autoIncr + 1}`,
        score: 60,
        strand: '+'
      }];
      setAutoIncr(autoIncr + 1);
      setPendingItems(newPendingItems);
    },
    [pendingItems, autoIncr, config.refSequenceName]
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
        const rawBed = await readFile(file);
        for (const row of rawBed.split(/[\r\n]+/g)) {
          const [, start, end, name,, strand] = row.split('\t');
          if (!isNaN(start) && !isNaN(end)) {
            newItems.push({
              idx: newAutoIncr ++,
              region: config.refSequenceName || '<Unknown>',
              start: Number.parseInt(start),
              end: Number.parseInt(end),
              name: name || `Primer-${autoIncr + 1}`,
              score: 60,
              // drop invalid strand
              strand: strand === '+' || strand === '-' ? strand : '+'
            });
          }
        }
      }

      if (!mounted.current) {
        return;
      }
      onChange(name, [...value, ...newItems]);
      setAutoIncr(newAutoIncr);
    },
    [autoIncr, onChange, name, value, config.refSequenceName]
  );

  return <div className={style['scroll']}>
    {errors ? <ul className={style['fielderrors']}>
      {errors.map((error, idx) => <li key={idx}>{error}</li>)}
    </ul> : null}
    {value.map(
      item => (
        <ItemInput
         key={`primer-bed-${item.idx}`}
         name={name}
         value={item}
         refSequence={refSequence}
         onChange={handleChange} />
      )
    )}
    {pendingItems.map(
      item => (
        <ItemInput
         isNew
         key={`primer-bed-${item.idx}`}
         name={name}
         value={item}
         refSequence={refSequence}
         onChange={handleChange} />
      )
    )}
    {isRefSeqPending ?
      <InlineLoader /> :
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
           accept=".bed,.gz"
           onChange={handleUpload}>
            Upload BED
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
      </div>}
  </div>;
}

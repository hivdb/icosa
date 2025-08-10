import React from 'react';
import classNames from 'classnames';

import Button from '../../../button';
import FileInput from '../../../file-input';
import {type PrimerSeq} from '../types';
import {parseFasta} from '../../../../utils/fasta';
import readFile from '../../../../utils/read-file';
import useMounted from '../../../../utils/use-mounted';

import ItemInput from './item-input';
import useValidation from './use-validation';
import style from '../style.module.scss';


function detectHeaderType(header: string): PrimerSeq['type'] {
  if (/forward|left|fwd|5-?end/i.test(header)) {
    return 'five-end';
  }
  else if (/backward|reverse|right|bwd|rev|rvs|3-?end/i.test(header)) {
    return 'three-end';
  }
  return 'both-end';
}


export interface PrimerSequenceInputProps {
  name: string;
  value: PrimerSeq[];
  onChange: (name: string, value: PrimerSeq[]) => void;
}

export default function PrimerSequenceInput({
  name,
  value,
  onChange
}: PrimerSequenceInputProps) {
  const isMounted = useMounted();
  const [autoIncr, setAutoIncr] = React.useState(
    value.length > 0 ? Math.max(
      ...value.map(({idx}) => idx)
    ) + 1 : 0
  );
  const [pendingItems, setPendingItems] = React.useState<PrimerSeq[]>([]);
  const errors = useValidation(value);

  const handleChange = React.useCallback(
    (item: PrimerSeq | {idx: number}, isNew: boolean, isRemove = false) => {
      const newValue = [...value];
      if (isNew) {
        if (!isRemove) {
          // add a new item
          newValue.push(item as PrimerSeq);
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
          newValue[idx] = item as PrimerSeq;
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
      const newPendingItems: PrimerSeq[] = [...pendingItems, {
        idx: autoIncr,
        header: `Primer-${autoIncr + 1}`,
        sequence: '',
        type: 'both-end' as const
      }];
      setAutoIncr(autoIncr + 1);
      setPendingItems(newPendingItems);
    },
    [pendingItems, autoIncr]
  );

  const handleUpload = React.useCallback(
    async (files: File[]) => {
      const newItems: PrimerSeq[] = [];
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
            type: detectHeaderType(header)
          });
        }
      }

      if (!isMounted()) {
        return;
      }
      onChange(name, [...value, ...newItems]);
      setAutoIncr(newAutoIncr);
    },
    [onChange, autoIncr, name, value, isMounted]
  );

  return <div className={style['scroll']}>
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
         name="upload-primer-fasta"
         multiple
         hideSelected
         btnStyle="info"
         accept=".fasta,.fas,.fa,.txt,.gz"
         onChange={handleUpload}>
          Upload FASTA
        </FileInput>
        <span className={style.or}> or </span>
        <Button
         name="add-new-primer-seq"
         btnStyle="primary"
         onClick={handleAddNew}>
          {value.length + pendingItems.length === 0 ?
            'Add one primer' : 'Add more primer'}
        </Button>
        <Button
         name="reset-primer-seq"
         disabled={value.length + pendingItems.length === 0}
         btnStyle="light"
         onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  </div>;
}

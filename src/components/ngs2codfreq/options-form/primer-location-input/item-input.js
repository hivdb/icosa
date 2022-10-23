import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {HoverPopup} from '../../../popup';
import Button from '../../../button';
import RadioInput from '../../../radio-input';

import {primerBedShape} from '../prop-types';
import style from '../style.module.scss';

import NameInput from './item-name-input';


PrimerBedItemInput.propTypes = {
  isNew: PropTypes.bool,
  name: PropTypes.string.isRequired,
  value: primerBedShape,
  refSequence: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

PrimerBedItemInput.defaultProps = {
  isNew: false
};

export default function PrimerBedItemInput({
  isNew,
  name,
  value: {
    idx,
    region,
    start,
    end,
    name: seqName,
    score,
    strand
  },
  refSequence,
  onChange
}) {
  const [
    unsavedStart,
    setUnsavedStart
  ] = React.useState(start);
  const [
    unsavedEnd,
    setUnsavedEnd
  ] = React.useState(end);
  const [
    unsavedName,
    setUnsavedName
  ] = React.useState(seqName);
  const [
    unsavedStrand,
    setUnsavedStrand
  ] = React.useState(strand);

  const dirty = (
    unsavedStart !== start ||
    unsavedEnd !== end ||
    unsavedName !== seqName ||
    unsavedStrand !== strand
  );

  const seqPreview = React.useMemo(
    () => {
      const extend = 10;
      const symbol = unsavedStrand === '+' ? '>' : '<';
      if (
        isNaN(unsavedStart) ||
        isNaN(unsavedEnd) ||
        unsavedStart < 0 ||
        unsavedEnd < 0 ||
        unsavedEnd <= unsavedStart
      ) {
        return null;
      }
      let primer = (
        ' '.repeat(extend) +
        refSequence +
        ' '.repeat(extend)
      ).slice(
        unsavedStart,
        unsavedEnd + extend * 2
      );
      let pointer = '\xa0'.repeat(extend) +
        symbol.repeat(unsavedEnd - unsavedStart) +
        '\xa0'.repeat(extend);
      const primerLen = primer.length;
      primer = primer.replace(/^ +/, '');
      const leftTrim = primerLen - primer.length;
      primer = primer.replace(/ +$/, '');
      const rightTrim = primerLen - leftTrim - primer.length;
      pointer = pointer.slice(leftTrim, pointer.length - rightTrim);
      const match = new RegExp(`([${symbol}]+)`).exec(pointer);
      const left = match.index;
      const right = left + match[1].length;
      return <>
        {primer.slice(0, left)}
        <span className={style['hl-primer-seq']}>
          {primer.slice(left, right)}
        </span>
        {primer.slice(right)}
        <br />
        {pointer}
      </>;
    },
    [refSequence, unsavedStart, unsavedEnd, unsavedStrand]
  );

  const handleSelectAll = React.useCallback(
    event => event.currentTarget.select(),
    []
  );

  const handleStartChange = React.useCallback(
    event => setUnsavedStart(
      Number.parseInt(event.currentTarget.value)
    ),
    []
  );

  const handleEndChange = React.useCallback(
    event => setUnsavedEnd(
      Number.parseInt(event.currentTarget.value)
    ),
    []
  );

  const handleStrandChange = React.useCallback(
    event => setUnsavedStrand(
      event.currentTarget.value
    ),
    []
  );

  const handleSave = React.useCallback(
    () => onChange({
      idx,
      region,
      start: unsavedStart,
      end: unsavedEnd,
      name: unsavedName,
      score,
      strand: unsavedStrand
    }, isNew),
    [
      region,
      unsavedStart,
      unsavedEnd,
      unsavedName,
      score,
      unsavedStrand,
      idx,
      onChange,
      isNew
    ]
  );

  const handleReset = React.useCallback(
    () => {
      setUnsavedStart(start);
      setUnsavedEnd(end);
      setUnsavedName(seqName);
      setUnsavedStrand(strand);
    },
    [start, end, seqName, strand]
  );

  const handleRemove = React.useCallback(
    () => onChange({idx}, isNew, true),
    [idx, isNew, onChange]
  );

  return <div
   className={classNames(
     style['fieldrow'],
     style['primer-sequence-row']
   )}
   data-dirty={dirty}>
    <div className={classNames(
      style['fieldlabel'],
      style['primer-sequence-label']
    )}>
      <NameInput
       name={`${name}-${idx}-name`}
       value={unsavedName}
       setValue={setUnsavedName} />
      {isNew || dirty ?
        <Button
         className={style['btn-save-item']}
         disabled={
           unsavedName === '' ||
           unsavedStart < 0 ||
           unsavedEnd <= unsavedStart
         }
         btnSize="small"
         btnStyle="primary"
         onClick={handleSave}>
          {isNew ? 'Add' : 'Update'}
        </Button> : null}
      {dirty ?
        <Button
         className={style['btn-reset-item']}
         btnSize="small"
         btnStyle="light"
         onClick={handleReset}>
          Reset
        </Button> :
        <Button
         className={style['btn-remove-item']}
         btnSize="small"
         btnStyle="light"
         onClick={handleRemove}>
          Remove
        </Button>}
    </div>
    <div className={classNames(
      style['fieldinput'],
      style['primer-bed-input']
    )}>
      <input
       type="number"
       id={`${name}-${idx}-start`}
       name={`${name}-${idx}-start`}
       className={style['number-input']}
       value={unsavedStart < 0 || isNaN(unsavedStart) ?
         '' : unsavedStart}
       onClick={handleSelectAll}
       placeholder="Start"
       min="1"
       max={refSequence.length}
       onChange={handleStartChange} />
      <div className={style.tilde}>~</div>
      <input
       type="number"
       id={`${name}-${idx}-end`}
       name={`${name}-${idx}-end`}
       className={style['number-input']}
       value={unsavedEnd < 0 || isNaN(unsavedEnd) ? '' : unsavedEnd}
       onClick={handleSelectAll}
       placeholder="End"
       min="1"
       max={refSequence.length}
       onChange={handleEndChange} />
      {seqPreview ?
        <pre className={style['sequence-preview']}>
          {seqPreview}
        </pre> : null}
      <div className={style['primer-strand-options']}>
        {[['+', 'forward (+)'], ['-', 'reverse (-)']].map(
          ([value, label]) => (
            <HoverPopup
             noUnderline
             key={`strand-${value}`}
             position="bottom"
             message={<>
               Strand is taken into account while doing the trimming. Forward
               primers are trimmed only from forward (+) strand and reverse
               primers are trimmed from reverse (-) strand.
             </>}>
              <RadioInput
               id={`${name}-${idx}-strand-${value}`}
               name={`${name}-${idx}-strand`}
               className={style['primer-sequence-radio-option']}
               onChange={handleStrandChange}
               value={value}
               checked={value === unsavedStrand}>
                {label}
              </RadioInput>
            </HoverPopup>
          )
        )}
      </div>
    </div>
  </div>;
}

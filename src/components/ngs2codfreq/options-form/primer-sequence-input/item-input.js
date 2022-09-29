import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import ExtLink from '../../../link/external';
import {HoverPopup} from '../../../popup';
import Button from '../../../button';
import RadioInput from '../../../radio-input';

import {primerSeqShape} from '../prop-types';
import style from '../style.module.scss';


function useEndsType(sequence, setSequence) {
  const threeEndType = React.useMemo(
    () => {
      const [seq] = sequence.split(';', 1);
      if (seq.length > 1) {
        if (seq.endsWith('X')) {
          return 'non-internal';
        }
        if (seq.endsWith('$')) {
          return 'anchored';
        }
      }
      return 'regular';
    },
    [sequence]
  );

  const fiveEndType = React.useMemo(
    () => {
      if (sequence.length > 1) {
        if (sequence.startsWith('X')) {
          return 'non-internal';
        }
        if (sequence.startsWith('^')) {
          return 'anchored';
        }
      }
      return 'regular';
    },
    [sequence]
  );

  const setThreeEndType = React.useCallback(
    event => {
      const type = event.currentTarget.value;
      const [seq, ...seqopts] = sequence.split(';');
      const bareSeq = seq.replace(/[X$]$/, '');
      if (type === 'regular') {
        setSequence([bareSeq, ...seqopts].join(';'));
      }
      else if (type === 'anchored') {
        setSequence([bareSeq + '$', ...seqopts].join(';'));
      }
      else if (type === 'non-internal') {
        setSequence([bareSeq + 'X', ...seqopts].join(';'));
      }
    },
    [setSequence, sequence]
  );

  const setFiveEndType = React.useCallback(
    event => {
      const type = event.currentTarget.value;
      const bareSeq = sequence.replace(/^[X^]/, '');
      if (type === 'regular') {
        setSequence(bareSeq);
      }
      else if (type === 'anchored') {
        setSequence('^' + bareSeq);
      }
      else if (type === 'non-internal') {
        setSequence('X' + bareSeq);
      }
    },
    [setSequence, sequence]
  );

  return {
    threeEndType,
    setThreeEndType,
    fiveEndType,
    setFiveEndType
  };
}


HelpLink.propTypes = {
  option: PropTypes.string.isRequired,
  anchor: PropTypes.string.isRequired
};

function HelpLink({option, anchor}) {
  return <>
    Cutadapt option "{option}".
    <br />
    Check {' '}
    <ExtLink
     href={
       "https://cutadapt.readthedocs.io/en/v4.1/guide.html" +
       anchor
     }>
      the documentation
    </ExtLink> for more information.
  </>;
}


PrimerSeqItemInput.propTypes = {
  isNew: PropTypes.bool,
  name: PropTypes.string.isRequired,
  value: primerSeqShape,
  onChange: PropTypes.func.isRequired
};

PrimerSeqItemInput.defaultProps = {
  isNew: false
};

export default function PrimerSeqItemInput({
  isNew,
  name,
  value: {
    idx,
    header,
    sequence,
    type
  },
  onChange
}) {
  const textAreaRef = React.useRef();
  const [
    unsavedHeader,
    setUnsavedHeader
  ] = React.useState(header || `Primer-${idx + 1}`);
  const [
    unsavedSeq,
    setUnsavedSeq
  ] = React.useState(sequence);
  const [
    unsavedType,
    setUnsavedType
  ] = React.useState(type);

  const {
    threeEndType,
    setThreeEndType,
    fiveEndType,
    setFiveEndType
  } = useEndsType(unsavedSeq, setUnsavedSeq);

  const handleHeaderChange = React.useCallback(
    event => setUnsavedHeader(event.currentTarget.value),
    []
  );

  const handleSeqChange = React.useCallback(
    event => setUnsavedSeq(event.currentTarget.value),
    []
  );

  const handleTypeChange = React.useCallback(
    event => setUnsavedType(event.currentTarget.value),
    []
  );

  const handleSave = React.useCallback(
    () => onChange({
      idx,
      header: unsavedHeader,
      sequence: unsavedSeq,
      type: unsavedType
    }, isNew),
    [unsavedHeader, unsavedSeq, unsavedType, idx, onChange, isNew]
  );

  const handleRemove = React.useCallback(
    () => onChange({idx}, isNew, true),
    [idx, isNew, onChange]
  );

  return <div className={style['fieldrow']}>
    <div className={classNames(
      style['fieldlabel'],
      style['primer-sequence-label']
    )}>
      <HoverPopup
       noUnderline
       position="left"
       message={<>
         Primer header (optional)
       </>}>
        <input
         type="text"
         id={`${name}-${idx}-name`}
         name={`${name}-${idx}-name`}
         className={style['name-input']}
         value={unsavedHeader}
         placeholder="Header"
         onChange={handleHeaderChange} />
      </HoverPopup>
      {isNew || unsavedHeader !== header || unsavedSeq !== sequence ?
        <Button
         className={style['btn-save-item']}
         disabled={unsavedHeader === '' || unsavedSeq === ''}
         btnSize="small"
         btnStyle="primary"
         onClick={handleSave}>
          {isNew ? 'Add' : 'Update'}
        </Button> : null}
      <Button
       className={style['btn-remove-item']}
       btnSize="small"
       btnStyle="light"
       onClick={handleRemove}>
        Remove
      </Button>
    </div>
    <div className={classNames(
      style['fieldinput'],
      style['primer-sequence-input']
    )}>
      <textarea
       ref={textAreaRef}
       className={style['sequence-textarea']}
       id={`${name}-${idx}-seq`}
       name={`${name}-${idx}-seq`}
       value={unsavedSeq}
       placeholder="Primer sequence"
       onChange={handleSeqChange} />
      <HoverPopup
       position="left"
       message={<HelpLink option="-b" anchor="#or-3-adapters" />}>
        <RadioInput
         id={`${name}-${idx}-both-end`}
         name={`${name}-${idx}-end`}
         className={style['switch-radio']}
         value="both-end"
         onChange={handleTypeChange}
         checked={unsavedType === 'both-end'}>
          5′ and 3′ end
        </RadioInput>
      </HoverPopup>
      <HoverPopup
       position="left"
       message={<HelpLink option="-g" anchor="#id4" />}>
        <RadioInput
         disabled={threeEndType !== 'regular'}
         id={`${name}-${idx}-five-end`}
         name={`${name}-${idx}-end`}
         className={style['switch-radio']}
         value="five-end"
         onChange={handleTypeChange}
         checked={unsavedType === 'five-end'}>
          5′ end only
        </RadioInput>
      </HoverPopup>
      <HoverPopup
       position="left"
       message={<HelpLink option="-a" anchor="#id3" />}>
        <RadioInput
         disabled={fiveEndType !== 'regular'}
         id={`${name}-${idx}-three-end`}
         name={`${name}-${idx}-end`}
         className={style['switch-radio']}
         value="three-end"
         onChange={handleTypeChange}
         checked={unsavedType === 'three-end'}>
          3′ end only
        </RadioInput>
      </HoverPopup>
    </div>
    <div className={classNames(
      style['fielddesc'],
      style['primer-sequence-options']
    )}>
      <div>
        <label
         className={style['primer-sequence-option-label']}
         htmlFor={`${name}-${idx}-three-end-type`}>
          3′ end trimming type:
        </label>
        {['regular', 'anchored', 'non-internal'].map(
          trimmingType => (
            <HoverPopup
             position="bottom"
             message={(
               <HelpLink
                option={'-a' + {
                  anchored: ' ...$',
                  'non-internal': ' ...X',
                  regular: ''
                }[trimmingType]}
                anchor={{
                  anchored: '#anchored-3-adapters',
                  'non-internal': '#non-internal-5-and-3-adapters',
                  regular: '#regular-3-adapters'
                }[trimmingType]}
               />
            )}>
              <RadioInput
               key={`three-end-${trimmingType}`}
               disabled={unsavedSeq.length < 2 || unsavedType === 'five-end'}
               id={`${name}-${idx}-three-end-type-${trimmingType}`}
               name={`${name}-${idx}-three-end-type`}
               className={style['primer-sequence-radio-option']}
               onChange={setThreeEndType}
               value={trimmingType}
               checked={threeEndType === trimmingType}>
                {trimmingType}
              </RadioInput>
            </HoverPopup>
          )
        )}
      </div>
      <div>
        <label
         className={style['primer-sequence-option-label']}
         htmlFor={`${name}-${idx}-five-end-type`}>
          5′ end trimming type:
        </label>
        {['regular', 'anchored', 'non-internal'].map(
          trimmingType => (
            <HoverPopup
             position="bottom"
             message={(
               <HelpLink
                option={'-g' + {
                  anchored: ' ^...',
                  'non-internal': ' X...',
                  regular: ''
                }[trimmingType]}
                anchor={{
                  anchored: '#anchored-5-adapters',
                  'non-internal': '#non-internal-5-and-3-adapters',
                  regular: '#regular-5-adapters'
                }[trimmingType]}
               />
            )}>
              <RadioInput
               key={`five-end-${trimmingType}`}
               disabled={unsavedSeq.length < 2 || unsavedType === 'three-end'}
               id={`${name}-${idx}-five-end-type-${trimmingType}`}
               name={`${name}-${idx}-five-end-type`}
               className={style['primer-sequence-radio-option']}
               onChange={setFiveEndType}
               value={trimmingType}
               checked={fiveEndType === trimmingType}>
                {trimmingType}
              </RadioInput>
            </HoverPopup>
          )
        )}
      </div>
    </div>
  </div>;
}

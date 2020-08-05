import React, {createRef} from 'react';
import PropTypes from 'prop-types';

import Button from '../../../../components/button';
import {
  posShape, citationShape, annotShape
} from '../../prop-types';

import style from './style.module.scss';
import CitationFilter from './citation-filter';

const AMINO_ACIDS = [
  'A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L',
  'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'Y',
  'i', 'd'
];


class AA extends React.Component {

  static propTypes = {
    aa: PropTypes.string.isRequired,
    refAA: PropTypes.string.isRequired,
    elemRef: PropTypes.object.isRequired,
    position: PropTypes.number.isRequired,
    onToggle: PropTypes.func.isRequired,
    onArrowKeyDown: PropTypes.func.isRequired,
    onAAKeyDown: PropTypes.func.isRequired,
    selected: PropTypes.bool.isRequired
  }

  handleKeyDown = (evt) => {
    const {onToggle, onAAKeyDown, onArrowKeyDown} = this.props;
    const {key} = evt;
    switch (key) {
      case ' ':
        evt.stopPropagation();
        evt.preventDefault();
        onToggle(evt);
        break;
      case 'ArrowUp':
      case 'ArrowRight':
      case 'ArrowDown':
      case 'ArrowLeft':
        evt.stopPropagation();
        evt.preventDefault();
        onArrowKeyDown(evt);
        break;
      default:
        if (AMINO_ACIDS.includes(key.toUpperCase())) {
          onAAKeyDown(evt);
        }
        // pass
    }
  }

  render() {
    const {
      aa, refAA, position, elemRef,
      onToggle, selected
    } = this.props;
    let inner = aa;
    if (aa === 'i') {
      inner = <em title="insertion">ins</em>;
    }
    else if (aa === 'd') {
      inner = <em title="deletion">del</em>;
    }
    return (
      <div
       tabIndex="0"
       ref={elemRef}
       data-position={position}
       data-selected={selected}
       data-aa={aa}
       data-is-ref={aa === refAA}
       onClick={onToggle}
       onKeyDown={this.handleKeyDown}
       className={style['amino-acid']}>
        {inner}
      </div>
    );
  }

}


function getKnownAAs(props) {
  const {
    positionLookup: posLookup,
    selectedPosition,
    curAnnot: {
      name: annotName
    },
    displayCitationIds
  } = props;
  const posdata = posLookup[selectedPosition];
  if (!posdata) {
    return;
  }
  const {aminoAcids} = posdata;
  if (!aminoAcids) {
    return;
  }
  const knownAAs = [];
  for (const {aminoAcid, annotations} of aminoAcids) {
    if (annotations.some(({name, citationIds}) => (
      name === annotName &&
      citationIds.some(cid => displayCitationIds.includes(cid))
    ))) {
      knownAAs.push(aminoAcid);
    }
  }
  return knownAAs;
}


export default class AAAnnotEditBox extends React.Component {

  static propTypes = {
    positionLookup: PropTypes.objectOf(posShape.isRequired).isRequired,
    citations: PropTypes.objectOf(citationShape.isRequired).isRequired,
    curAnnot: annotShape.isRequired,
    referredCitationIds: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    displayCitationIds: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    selectedPosition: PropTypes.number.isRequired,
    sequence: PropTypes.string.isRequired,
    onDisplayCitationIdsChange: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
  }

  static getDerivedStateFromProps(props, state = {}) {
    const {selectedPosition} = props;
    if (state.selectedPosition === selectedPosition) {
      return null;
    }
    return {
      aminoAcids: getKnownAAs(props),
      selectedPosition
    };
  }

  constructor() {
    super(...arguments);
    this.state = this.constructor.getDerivedStateFromProps(this.props);
    this.aaRefs = {};
    for (const aa of AMINO_ACIDS) {
      this.aaRefs[aa] = createRef();
    }
  }

  componentDidMount() {
    document.addEventListener('keyup', this.handleGlobalKeyUp, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleGlobalKeyUp);
  }

  handleGlobalKeyUp = (evt) => {
    const {key} = evt;
    switch (key) {
      case 'Backspace':
        this.handleRemove();
        break;
      default:
        // pass
    }
  }

  get numAAPerRow() {
    let firstRowTop, numPos = 0;
    for (const elemRef of Object.values(this.aaRefs)) {
      const rect = elemRef.current.getBoundingClientRect();
      if (numPos === 0) {
        numPos = 1;
        firstRowTop = rect.top;
      }
      else if (Math.abs(rect.top - firstRowTop) < 1) {
        // allow <1px error
        numPos += 1;
      }
      else {
        break;
      }
    }
    return numPos;
  }

  handleToggle = ({currentTarget: {dataset}}) => {
    let {aminoAcids} = this.state;
    const {selected, aa: targetAA} = dataset;
    if (selected === 'true') {
      // deselect
      aminoAcids = aminoAcids.filter(aa => aa !== targetAA);
    }
    else {
      // select
      aminoAcids.push(targetAA);
    }
    this.setState({aminoAcids});
  }

  handleAAKeyDown = (evt) => {
    const {key} = evt;
    const upperKey = key.toUpperCase();
    const lowerKey = key.toLowerCase();
    const curAA = evt.currentTarget.dataset.aa;
    let newAA = upperKey;
    if (
      curAA === upperKey &&
      AMINO_ACIDS.includes(lowerKey)
    ) {
      newAA = lowerKey;
    }
    if (newAA !== curAA) {
      this.aaRefs[newAA].current.focus();
    }
  }

  handleArrowKeyDown = (evt) => {
    const {key} = evt;
    const {numAAPerRow} = this;
    const direction = key.slice(5).toLowerCase();
    const curAA = evt.currentTarget.dataset.aa;
    let curAAIdx = AMINO_ACIDS.indexOf(curAA);
    switch (direction) {
      case 'left':
        curAAIdx --;
        break;
      case 'right':
        curAAIdx ++;
        break;
      case 'up':
        curAAIdx -= numAAPerRow;
        break;
      case 'down':
        curAAIdx += numAAPerRow;
        break;
      default:
        break;
    }
    if (curAAIdx < 0 || curAAIdx >= AMINO_ACIDS.length) {
      return;
    }
    const newAA = AMINO_ACIDS[curAAIdx];
    this.aaRefs[newAA].current.focus();
  }

  handleReset = () => {
    this.setState({
      aminoAcids: getKnownAAs(this.props)
    });
    this.props.onReset();
  }

  handleSave = () => {
    const {
      onSave,
      selectedPosition,
      curAnnot,
      displayCitationIds
    } = this.props;
    const {aminoAcids} = this.state;
    onSave({
      action: 'editAminoAcids',
      selectedPosition,
      curAnnot,
      aminoAcids,
      citationIds: displayCitationIds
    });
  }

  handleRemove = () => {
    const {
      onSave,
      selectedPosition,
      curAnnot,
      displayCitationIds
    } = this.props;
    onSave({
      action: 'editAminoAcids',
      selectedPosition,
      curAnnot,
      aminoAcids: [],
      citationIds: displayCitationIds
    });
  }

  render() {
    const {editMode} = this;
    const {
      selectedPosition,
      referredCitationIds,
      displayCitationIds,
      onDisplayCitationIdsChange,
      onSave,
      citations,
      sequence
    } = this.props;
    const {
      aminoAcids
    } = this.state;

    if (displayCitationIds.length === 0) {
      return <div className={style['input-group']}>
        <div className={style['dialog']}>
          <p className={style['warning']}>
            At least one citaiton must be select for
            editing annotations.
          </p>
        </div>
      </div>;
    }

    setTimeout(() => {
      this.aaRefs[AMINO_ACIDS[0]].current.focus();
    }, 0);

    return (
      <div className={style['input-group']}>
        <div className={style['dialog']}>
          {editMode !== 'remove' ? <>
            <p>
              Following citations will be added for current annotation.
              Please use the above "<strong>Citations</strong>" section To
              add/edit/remove citations.
            </p>
            <div>
              <CitationFilter
               citations={citations}
               useInputGroup={false}
               referredCitationIds={referredCitationIds}
               displayCitationIds={displayCitationIds}
               onSave={onSave}
               onChange={onDisplayCitationIdsChange} />
            </div>
          </> : null}
          <p>
            Select annotated amino acid(s) / indel(s) at position{' '}
            <strong>{selectedPosition}</strong>:
          </p>
          <div className={style['amino-acids']}>
            {AMINO_ACIDS.map(aa => (
              <AA
               key={aa}
               aa={aa}
               elemRef={this.aaRefs[aa]}
               refAA={sequence.charAt(selectedPosition - 1)}
               selected={aminoAcids.includes(aa)}
               onToggle={this.handleToggle}
               onAAKeyDown={this.handleAAKeyDown}
               onArrowKeyDown={this.handleArrowKeyDown}
               position={selectedPosition} />
            ))}
          </div>
          <div className={style['inline-buttons']}>
            <Button
             name="edit-amino-acids"
             btnStyle="primary"
             onClick={this.handleSave}>
              Save
            </Button>
            <Button
             name="cancel-edit-amino-acids"
             btnStyle="light"
             onClick={this.handleReset}>
              Cancel
            </Button>
            {aminoAcids.length > 0 ?
              <Button
               name="remove-position"
               btnStyle="link"
               title="Remove this position from current group"
               onClick={this.handleRemove}>
                Remove position
              </Button> : null}
          </div>
        </div>
      </div>
    );
  }

}

import React, {createRef} from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import {FaRegEdit, FaRegPlusSquare, FaRegMinusSquare} from 'react-icons/fa';

import Button from '../../../../components/button';
import {
  posShape, citationShape, annotShape
} from '../../prop-types';
import {getAnnotation} from '../../utils';

import style from './style.module.scss';
import CitationFilter from './citation-filter';

const ANNOT_VAL_MAX_SIZE = 8;



function getDefaultAnnotVal(props) {
  const {
    positionLookup: posLookup,
    selectedPositions,
    curAnnot: {name: annotName},
    displayCitationIds
  } = props;
  const annotValCounter = {};
  for (const pos of selectedPositions) {
    const posdata = posLookup[pos];
    if (!posdata) {
      continue;
    }
    const {annotations} = posdata;
    const {annotVal} = getAnnotation(
      annotations, annotName, displayCitationIds
    );
    if (annotVal !== null) {
      annotValCounter[annotVal] = annotValCounter[annotVal] || 0;
      annotValCounter[annotVal] ++;
    }
  }
  if (isEmpty(annotValCounter)) {
    return 'X';
  }
  else {
    return (
      Object.entries(annotValCounter)
        .sort((a, b) => b[1] - a[1])
    )[0][0];
  }
}


function getDefaultAnnotDesc(props) {
  const {
    positionLookup: posLookup,
    selectedPositions,
    curAnnot: {name: annotName},
    displayCitationIds
  } = props;
  const annotDescCounter = {};
  for (const pos of selectedPositions) {
    const posdata = posLookup[pos];
    if (!posdata) {
      continue;
    }
    const {annotations} = posdata;
    const {annotDesc} = getAnnotation(
      annotations, annotName, displayCitationIds
    );
    if (annotDesc !== null) {
      annotDescCounter[annotDesc] = annotDescCounter[annotDesc] || 0;
      annotDescCounter[annotDesc] ++;
    }
  }
  if (isEmpty(annotDescCounter)) {
    return '';
  }
  else {
    return (
      Object.entries(annotDescCounter)
        .sort((a, b) => b[1] - a[1])
    )[0][0];
  }
}

export default class PosAnnotEditBox extends React.Component {

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
    selectedPositions: PropTypes.arrayOf(
      PropTypes.number.isRequired
    ).isRequired,
    onDisplayCitationIdsChange: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
  }

  static getDerivedStateFromProps(props, state = {}) {
    const {selectedPositions} = props;
    if (state.selectedPositions === selectedPositions) {
      return null;
    }
    return {
      annotVal: getDefaultAnnotVal(props),
      annotDesc: getDefaultAnnotDesc(props),
      showSetAnnotValDialog: false,
      selectedPositions: props.selectedPositions
    };
  }

  constructor() {
    super(...arguments);
    this.state = this.constructor.getDerivedStateFromProps(this.props);
    this.annotValInputRef = createRef();
  }

  componentDidMount() {
    document.addEventListener('keyup', this.handleGlobalKeyUp, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleGlobalKeyUp);
  }

  handleGlobalKeyUp = (evt) => {
    const {key} = evt;
    const {showSetAnnotValDialog} = this.state;
    switch (key) {
      case 'Enter':
        if (evt.target.tagName === 'TEXTAREA') {
          break;
        }
        if (showSetAnnotValDialog) {
          this.handlePosAnnotUpdate.add();
        }
        else {
          this.handlePosAnnotUpdate.edit();
        }
        break;
      case 'Backspace':
        if (!showSetAnnotValDialog) {
          this.handlePosAnnotUpdate.remove();
        }
        break;
      default:
        // pass
    }
  }

  get editMode() {
    const {positionLookup} = this.props;
    const {
      curAnnot: {name: annotName},
      selectedPositions,
      displayCitationIds
    } = this.props;
    let annotateds = 0;
    for (const pos of selectedPositions) {
      const posdata = positionLookup[pos];
      if (!posdata) {
        continue;
      }
      const {annotations} = posdata;
      const {annotVal} = getAnnotation(
        annotations, annotName, displayCitationIds
      );
      if (annotVal !== null) {
        annotateds ++;
      }
    }
    if (annotateds === selectedPositions.length) {
      return 'remove';
    }
    else if (annotateds === 0) {
      return 'add';
    }
    else {
      return 'edit';
    }
  }

  handleAnnotValChange = ({currentTarget: {value}}) => {
    value = value.slice(0, ANNOT_VAL_MAX_SIZE);
    this.setState({annotVal: value});
  }

  handleAnnotDescChange = ({currentTarget: {value}}) => {
    this.setState({annotDesc: value});
  }

  handleAnnotDescKeyDown = ({key, metaKey, ctrlKey}) => {
    if (key === 'Enter' && (metaKey || ctrlKey)) {
      this.handlePosAnnotUpdate.add();
    }
  }

  handleReset = () => {
    this.setState({
      annotVal: getDefaultAnnotVal(this.props),
      annotDesc: getDefaultAnnotDesc(this.props),
      showSetAnnotValDialog: false
    });
    this.props.onReset();
  }

  handlePosAnnotUpdate = {
    edit: () => {
      this.setState({
        showSetAnnotValDialog: true
      });
      setTimeout(() => {
        const {current} = this.annotValInputRef;
        if (current) {
          current.focus();
          current.select();
        }
      }, 0);
    },
    editBack: () => {
      this.setState({
        showSetAnnotValDialog: false
      });
    },
    add: () => {
      const {
        onSave,
        selectedPositions,
        curAnnot,
        displayCitationIds
      } = this.props;
      const {annotVal, annotDesc} = this.state;
      onSave({
        action: 'addPositions',
        selectedPositions,
        curAnnot,
        annotVal,
        annotDesc,
        citationIds: displayCitationIds
      });
    },
    remove: () => {
      const {
        onSave,
        selectedPositions,
        curAnnot,
        displayCitationIds
      } = this.props;
      onSave({
        action: 'removePositions',
        selectedPositions,
        curAnnot,
        citationIds: displayCitationIds
      });
    }
  }

  render() {
    const {editMode} = this;
    const {
      referredCitationIds,
      displayCitationIds,
      onDisplayCitationIdsChange,
      curAnnot: {
        name: curAnnotName,
      },
      curAnnot,
      onSave,
      citations
    } = this.props;
    const {
      annotVal, annotDesc,
      showSetAnnotValDialog
    } = this.state;

    const btnIconProps = {
      size: '1.2em',
      className: style['btn-icon']
    };

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

    return (
      <div className={style['input-group']}>
        {editMode === 'add' && !showSetAnnotValDialog ?
          <div className={style['dialog']}>
            Do you want to <strong>add</strong> these
            positions to group "{curAnnotName}"?
            <div className={style['inline-buttons']}>
              <Button
               name="edit-positions"
               btnStyle="primary"
               onClick={this.handlePosAnnotUpdate.edit}>
                <FaRegPlusSquare {...btnIconProps} />
                Add
              </Button>
              <Button
               name="reset"
               btnStyle="light"
               onClick={this.handleReset}>
                Cancel
              </Button>
            </div>
          </div> : null}
        {editMode === 'remove' && !showSetAnnotValDialog ?
          <div className={style['dialog']}>
            Do you want to <strong>edit</strong> the annotation
            or <strong>remove</strong> these positions from
            group "{curAnnotName}"?
            <div className={style['inline-buttons']}>
              <Button
               name="edit-positions"
               btnStyle="primary"
               onClick={this.handlePosAnnotUpdate.edit}>
                <FaRegEdit {...btnIconProps} />
                Edit
              </Button>
              <Button
               name="remove-positions"
               btnStyle="primary"
               onClick={this.handlePosAnnotUpdate.remove}>
                <FaRegMinusSquare {...btnIconProps} />
                Remove
              </Button>
              <Button
               name="reset"
               btnStyle="light"
               onClick={this.handleReset}>
                Cancel
              </Button>
            </div>
          </div> : null}
        {editMode === 'edit' && !showSetAnnotValDialog ?
          <div className={style['dialog']}>
            Multiple positions are selected. Do you want
            to <strong>add</strong> to or <strong>remove</strong> from
            group "{curAnnotName}"?
            <div className={style['inline-buttons']}>
              <Button
               name="edit-positions"
               btnStyle="primary"
               onClick={this.handlePosAnnotUpdate.edit}>
                <FaRegPlusSquare {...btnIconProps} />
                Add
              </Button>
              <Button
               name="remove-positions"
               btnStyle="primary"
               onClick={this.handlePosAnnotUpdate.remove}>
                <FaRegMinusSquare {...btnIconProps} />
                Remove
              </Button>
              <Button
               name="reset"
               btnStyle="light"
               onClick={this.handleReset}>
                Cancel
              </Button>
            </div>
          </div> : null}
        {showSetAnnotValDialog ?
          <div className={style['dialog']}>
            {editMode !== 'remove' ? <>
              <p>
                Following citations will be added for current annotation.
                Please use the above "<strong>Citations</strong>" section To
                add/edit/remove citations.
              </p>
              <div>
                <CitationFilter
                 allowEditing={true}
                 useInputGroup={false}
                 onChange={onDisplayCitationIdsChange}
                 {...{
                   curAnnot,
                   onSave,
                   citations,
                   referredCitationIds,
                   displayCitationIds
                 }} />
              </div>
            </> : null}
            <p>
              Enter a short annotation (maximum letters: {ANNOT_VAL_MAX_SIZE})
              to be showed when moving mouse over the selected position(s):
            </p>
            <input
             ref={this.annotValInputRef}
             onChange={this.handleAnnotValChange}
             value={annotVal}
             className={style['text-input']}
             type="text" name="annotVal" />
            <p>
              Enter a description for selected position(s):
            </p>
            <textarea
             className={style.textarea}
             value={annotDesc}
             name="annotDesc"
             onChange={this.handleAnnotDescChange} />
            <div className={style['inline-buttons']}>
              <Button
               name="add-positions"
               btnStyle="primary"
               onClick={this.handlePosAnnotUpdate.add}>
                Save
              </Button>
              <Button
               name="Cancel"
               btnStyle="light"
               onClick={this.handleReset}>
                Cancel
              </Button>
              <Button
               name="edit-back-positions"
               btnStyle="link"
               onClick={this.handlePosAnnotUpdate.editBack}>
                Back
              </Button>
            </div>
          </div> : null}
      </div>
    );
  }

}

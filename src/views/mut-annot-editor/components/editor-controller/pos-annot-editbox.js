import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import {FaRegEdit, FaRegPlusSquare, FaRegMinusSquare} from 'react-icons/fa';

import Button from '../../../../components/button';
import {
  posShape, citationShape, annotShape
} from '../../prop-types';

import style from './style.module.scss';
import CitationFilter from './citation-filter';



function isAnnotated(annotations, annotName, displayCitationIds) {
  for (const {name, value, citationIds} of annotations) {
    if (name !== annotName) {
      continue;
    }
    if (!citationIds.some(
      citeId => displayCitationIds.includes(citeId)
    )) {
      continue;
    }
    return [true, value];
  }
  return [false, null];
}


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
    const [annotatedFlag, annotVal] = isAnnotated(
      annotations, annotName, displayCitationIds
    );
    if (annotatedFlag) {
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
      showSetAnnotValDialog: false,
      selectedPositions: props.selectedPositions
    };
  }

  constructor() {
    super(...arguments);
    this.state = this.constructor.getDerivedStateFromProps(this.props);
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
        if (!showSetAnnotValDialog) {
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
      const [annotatedFlag] = isAnnotated(
        annotations, annotName, displayCitationIds
      );
      if (annotatedFlag) {
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
    this.setState({annotVal: value});
  }

  handleReset = () => {
    this.setState({
      annotVal: getDefaultAnnotVal(this.props),
      showSetAnnotValDialog: false
    });
    this.props.onReset();
  }

  handlePosAnnotUpdate = {
    edit: () => {
      this.setState({
        showSetAnnotValDialog: true
      });
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
      const {annotVal} = this.state;
      onSave({
        action: 'addPositions',
        selectedPositions,
        curAnnot,
        annotVal,
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
      citations
    } = this.props;
    const {
      annotVal,
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
                 citations={citations}
                 useInputGroup={false}
                 referredCitationIds={referredCitationIds}
                 displayCitationIds={displayCitationIds}
                 onChange={onDisplayCitationIdsChange} />
              </div>
            </> : null}
            <p>
              Enter an annotation to be showed when moving mouse
              over the selected positions:
            </p>
            <input
             onChange={this.handleAnnotValChange}
             value={annotVal}
             className={style['text-input']}
             type="text" name="annotVal" />
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

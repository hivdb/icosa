import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';
import makeClassNames from 'classnames';
import capitalize from 'lodash/capitalize';
import isEmpty from 'lodash/isEmpty';
import {FaRegPlusSquare, FaRegMinusSquare} from 'react-icons/fa';

import style from './style.module.scss';

import ExtLink from '../../../../components/link/external';
import Button from '../../../../components/button';
import CheckboxInput from '../../../../components/checkbox-input';
import {posShape, annotShape, seqViewerSizeType} from '../../prop-types';


function getPositionLookup(positions) {
  return positions.reduce((acc, posdata) => {
    acc[posdata.position] = posdata;
    return acc;
  }, {});
}


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
    positions,
    selectedPositions,
    annotation: {
      name: annotName,
      level: annotLevel
    },
    displayCitationIds
  } = props;
  if (annotLevel === 'aminoAcids') {
    return null;
  }
  const posLookup = getPositionLookup(positions);
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


export default class EditorController extends React.Component {

  static propTypes = {
    annotations: PropTypes.arrayOf(
      annotShape.isRequired
    ).isRequired,
    positions: PropTypes.arrayOf(posShape.isRequired).isRequired,
    citations: PropTypes.object.isRequired,
    className: PropTypes.string,
    annotation: annotShape.isRequired,
    referredCitationIds: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    displayCitationIds: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    seqViewerSize: seqViewerSizeType.isRequired,
    selectedPositions: PropTypes.arrayOf(
      PropTypes.number.isRequired
    ).isRequired,
    onSeqViewerSizeChange: PropTypes.func.isRequired,
    onAnnotationChange: PropTypes.func.isRequired,
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

  get annotationValue() {
    const {annotation} = this.props;
    return annotation.name;
  }

  get positionLookup() {
    const {positions} = this.props;
    return getPositionLookup(positions);
  }

  get annotationOptions() {
    const {annotations} = this.props;
    return annotations.map(({name}) => name);
  }

  get className() {
    const {className} = this.props;
    return makeClassNames(
      style['editor-controller'],
      className
    );
  }

  get isEditing() {
    const {selectedPositions} = this.props;
    return selectedPositions.length > 0;
  }

  handleAnnotChange = ({value}) => {
    const {annotations, onAnnotationChange} = this.props;
    for (const annot of annotations) {
      if (annot.name === value) {
        onAnnotationChange(annot);
      }
    }
  }

  get editMode() {
    if (!this.isEditing) {
      return null;
    }
    const {positionLookup} = this;
    const {
      annotation: {
        name: annotName,
        level: annotLevel
      },
      selectedPositions,
      displayCitationIds
    } = this.props;
    let annotateds = 0;
    for (const pos of selectedPositions) {
      const posdata = positionLookup[pos];
      if (!posdata) {
        continue;
      }
      if (annotLevel === 'position') {
        const {annotations} = posdata;
        const [annotatedFlag] = isAnnotated(
          annotations, annotName, displayCitationIds
        );
        if (annotatedFlag) {
          annotateds ++;
        }
      }
      else {
        const {aminoAcids} = posdata;
        for (const {annotations} of aminoAcids) {
          const [annotatedFlag] = isAnnotated(
            annotations, annotName, displayCitationIds
          );
          if (annotatedFlag) {
            annotateds ++;
          }
        }
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

  handleSelectAllCitations = (evt) => {
    evt.preventDefault();
    this.props.onDisplayCitationIdsChange(this.props.referredCitationIds);
  }

  handleUnselectAllCitations = (evt) => {
    evt.preventDefault();
    this.props.onDisplayCitationIdsChange([]);
  }

  handleDisplayCitationIdsChange = ({currentTarget: {value, checked}}) => {
    let {displayCitationIds} = this.props;
    if (checked) {
      // add
      displayCitationIds.push(value);
    }
    else {
      // remove
      displayCitationIds = displayCitationIds.filter(cid => cid !== value);
    }
    this.props.onDisplayCitationIdsChange(displayCitationIds);
  }

  handleSeqViewerSizeChange = ({currentTarget: {value}}) => {
    this.props.onSeqViewerSizeChange(value);
  }

  handleSave = () => {
    this.props.onSave();
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
        annotation,
        displayCitationIds
      } = this.props;
      onSave({
        action: 'addPositions',
        positions: selectedPositions,
        annotation: annotation,
        citationIds: displayCitationIds
      });
    },
    remove: () => {
      const {
        onSave,
        selectedPositions,
        annotation,
        displayCitationIds
      } = this.props;
      onSave({
        action: 'removePositions',
        positions: selectedPositions,
        annotation: annotation,
        citationIds: displayCitationIds
      });
    }
  }

  render() {
    const {
      className,
      annotationOptions,
      annotationValue,
      isEditing,
      editMode
    } = this;
    const {
      referredCitationIds,
      displayCitationIds,
      seqViewerSize,
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

    return (
      <div className={className}>
        <div className={style['input-group']}>
          <label htmlFor="size">Editor size:</label>
          <div className={style['inline-buttons']}>
            {['large', 'middle', 'small'].map(size => (
              <Button
               key={size}
               name="size"
               btnStyle={size === seqViewerSize ? 'primary' : 'light'}
               onClick={this.handleSeqViewerSizeChange}
               value={size}>
                {capitalize(size)}
              </Button>
            ))}
          </div>
        </div>
        <div className={style['input-group']}>
          <label htmlFor="annotation">Annotation filter:</label>
          <Dropdown
           value={annotationValue}
           options={annotationOptions}
           name="annotation"
           onChange={this.handleAnnotChange} />
        </div>
        <div className={style['input-group']}>
          <label>
            Citation filter (
            <a href="#select-all" onClick={this.handleSelectAllCitations}>
              select all
            </a>
            {', '}
            <a href="#unselect-all" onClick={this.handleUnselectAllCitations}>
              unselect all
            </a>
            ):
          </label>
          {referredCitationIds.map(citeId => (
            <CheckboxInput
             key={citeId}
             name="display-citations"
             id={`display-citations-${citeId}`}
             onChange={this.handleDisplayCitationIdsChange}
             className={style['citation-checkbox']}
             checked={displayCitationIds.includes(citeId)}
             value={citeId}>
              {(() => {
                const {author, year, doi, section} = citations[citeId];
                return <>
                  {author} {year} (
                  <ExtLink href={`https://doi.org/${doi}`}>paper</ExtLink>
                  )
                  <span className={style['citation-section']}>
                    {section}
                  </span>
                </>;
              })()}
            </CheckboxInput>
          ))}
        </div>
        {isEditing ?
          <div className={style['input-group']}>
            {editMode === 'add' && !showSetAnnotValDialog ?
              <div className={style['dialog']}>
                Do you want to <strong>add</strong> these
                positions to group "{annotationValue}"?
                <div className={style['inline-buttons']}>
                  <Button
                   name="edit-positions"
                   btnStyle="light"
                   onClick={this.handlePosAnnotUpdate.edit}>
                    <FaRegPlusSquare {...btnIconProps} />
                    Add
                  </Button>
                  <Button
                   name="reset"
                   btnStyle="light"
                   onClick={this.handleReset}>
                    Reset
                  </Button>
                </div>
              </div> : null}
            {editMode === 'remove' && !showSetAnnotValDialog ?
              <div className={style['dialog']}>
                Do you want to <strong>edit</strong> the annotation
                or <strong>remove</strong> these positions from
                group "{annotationValue}"?
                <div className={style['inline-buttons']}>
                  <Button
                   name="edit-positions"
                   btnStyle="light"
                   onClick={this.handlePosAnnotUpdate.edit}>
                    <FaRegPlusSquare {...btnIconProps} />
                    Edit
                  </Button>
                  <Button
                   name="remove-positions"
                   btnStyle="light"
                   onClick={this.handlePosAnnotUpdate.remove}>
                    <FaRegMinusSquare {...btnIconProps} />
                    Remove
                  </Button>
                  <Button
                   name="reset"
                   btnStyle="light"
                   onClick={this.handleReset}>
                    Reset
                  </Button>
                </div>
              </div> : null}
            {editMode === 'edit' && !showSetAnnotValDialog ?
              <div className={style['dialog']}>
                Multiple positions are selected. Do you want
                to <strong>add</strong> to or <strong>remove</strong> from
                group "{annotationValue}"?
                <div className={style['inline-buttons']}>
                  <Button
                   name="edit-positions"
                   btnStyle="light"
                   onClick={this.handlePosAnnotUpdate.edit}>
                    <FaRegPlusSquare {...btnIconProps} />
                    Add
                  </Button>
                  <Button
                   name="remove-positions"
                   btnStyle="light"
                   onClick={this.handlePosAnnotUpdate.remove}>
                    <FaRegMinusSquare {...btnIconProps} />
                    Remove
                  </Button>
                  <Button
                   name="reset"
                   btnStyle="light"
                   onClick={this.handleReset}>
                    Reset
                  </Button>
                </div>
              </div> : null}
            {showSetAnnotValDialog ?
              <div className={style['dialog']}>
                Enter an annotation to be showed when moving mouse
                over the selected positions:
                <input
                 onChange={this.handleAnnotValChange}
                 value={annotVal}
                 className={style['text-input']}
                 type="text" name="annotVal" />
                <div className={style['inline-buttons']}>
                  <Button
                   name="add-positions"
                   btnStyle="light"
                   onClick={this.handlePosAnnotUpdate.add}>
                    Save
                  </Button>
                  <Button
                   name="edit-back-positions"
                   btnStyle="light"
                   onClick={this.handlePosAnnotUpdate.editBack}>
                    Back
                  </Button>
                  <Button
                   name="reset"
                   btnStyle="light"
                   onClick={this.handleReset}>
                    Reset
                  </Button>
                </div>
              </div> : null}
          </div> : null}
      </div>
    );
  }

}

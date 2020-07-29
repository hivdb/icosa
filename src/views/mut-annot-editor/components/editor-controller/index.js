import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';
import makeClassNames from 'classnames';
import capitalize from 'lodash/capitalize';

import style from './style.module.scss';

import ExtLink from '../../../../components/link/external';
import Button from '../../../../components/button';
import CheckboxInput from '../../../../components/checkbox-input';
import {posShape, annotShape, seqViewerSizeType} from '../../prop-types';


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

  get annotationValue() {
    const {annotation} = this.props;
    return annotation.name;
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

  handleReset = () => {
    this.props.onReset();
  }

  render() {
    const {
      className,
      annotationOptions,
      annotationValue,
      isEditing
    } = this;
    const {
      referredCitationIds,
      displayCitationIds,
      seqViewerSize,
      citations
    } = this.props;

    return (
      <div className={className}>
        <div className={style['input-group']}>
          <label htmlFor="size">Editor size:</label>
          <div className={style['inline-buttons']}>
            {['large', 'middle', 'small'].map(size => (
              <Button
               key={size}
               name="size"
               btnStyle={size === seqViewerSize ? 'primary' : 'default'}
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
            {' | '}
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
            <label>Edit positions:</label>
            <div className={style['inline-buttons']}>
              <Button
               name="save"
               btnStyle="primary"
               onClick={this.handleSave}>
                Save
              </Button>
              <Button
               name="reset"
               btnStyle="default"
               onClick={this.handleReset}>
                Reset
              </Button>
            </div>
          </div> : null}
      </div>
    );
  }

}

import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';
import makeClassNames from 'classnames';

import style from './style.module.scss';

import {annotShape} from '../../prop-types';


export default class EditorController extends React.Component {

  static propTypes = {
    annotations: PropTypes.arrayOf(
      annotShape.isRequired
    ).isRequired,
    className: PropTypes.string,
    annotation: annotShape.isRequired,
    onAnnotationChange: PropTypes.func.isRequired
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

  handleAnnotChange = ({value}) => {
    const {annotations, onAnnotationChange} = this.props;
    for (const annot of annotations) {
      if (annot.name === value) {
        onAnnotationChange(annot);
      }
    }
  }

  render() {
    const {
      className,
      annotationOptions,
      annotationValue
    } = this;

    return (
      <div className={className}>
        <Dropdown
         value={annotationValue}
         options={annotationOptions}
         name="annotation"
         onChange={this.handleAnnotChange} />
      </div>
    );
  }

}

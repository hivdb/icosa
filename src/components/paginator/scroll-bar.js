import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';


export default class ScrollBar extends React.Component {

  static propTypes = {
    onScroll: PropTypes.func.isRequired
  };

  constructor() {
    super(...arguments);
    this.scrollBarRef = React.createRef();
    this.dragShadowRef = React.createRef();
    this.scrollbarStepRef = React.createRef();
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.onScroll !== this.props.onScroll;
  }

  getStepWidth() {
    return parseFloat(
      window.getComputedStyle(this.scrollbarStepRef.current)
        .getPropertyValue('width')
    );
  }

  handleMouseDown = evt => {
    if (evt.target !== evt.currentTarget) {
      // only process click event when the container is directly clicked
      return;
    }
    const rect = this.scrollBarRef.current.getBoundingClientRect();
    const xStart = rect.left + (rect.right - rect.left) / 2;
    const xOffset = evt.clientX - xStart;
    const stepOffset = Math.ceil(xOffset / this.getStepWidth());
    this.props.onScroll(stepOffset);
  };

  handleDragStart = evt => {
    this.xStart = evt.clientX;
    this.prevClientX = evt.clientX;
    this.stepOffset = 0;
    evt.dataTransfer.setDragImage(this.dragShadowRef.current, 0, 0);
  };

  handleDrag = evt => {
    const {xStart} = this;
    const {buttons, clientX} = evt;
    const halfClientWidth = document.body.clientWidth / 2;
    if (buttons === 0) {
      return;
    }
    if (Math.abs(clientX - this.prevClientX) > halfClientWidth) {
      // Ignores when clientX is suddenly changed (more than half
      // of the window width). This is usually caused by mouse moving
      // out of the window
      return;
    }
    this.prevClientX = clientX;

    const xOffset = clientX - xStart;
    const stepOffset = Math.ceil(xOffset / this.getStepWidth());
    if (stepOffset !== this.stepOffset) {
      const accepted = this.props.onScroll(stepOffset - this.stepOffset);
      if (accepted) {
        this.stepOffset = stepOffset;
      }
    }
  };

  render() {
    return (
      <div
       onMouseDown={this.handleMouseDown}
       className={style['scrollbar-container']}>
        <div
         draggable
         ref={this.scrollBarRef}
         onDragStart={this.handleDragStart}
         onDrag={this.handleDrag}
         className={style['scrollbar']} />
        <div
         ref={this.dragShadowRef}
         className={style['scrollbar-drag-shadow']} />
        <div
         ref={this.scrollbarStepRef}
         className={style['scrollbar-step']} />
      </div>
    );
  }

}

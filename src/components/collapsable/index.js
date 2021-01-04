import React from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';

import Context, {CollapsableContextValue} from './context';
import Section from './section';
import style from './style.module.scss';


export default class Collapsable extends React.Component {

  static propTypes = {
    levels: PropTypes.arrayOf(
      PropTypes.oneOf(['h2', 'h3', 'h4', 'h5', 'h6']).isRequired
    ).isRequired,
    children: PropTypes.node
  }

  static defaultProps = {
    levels: ['h3']
  }

  static Section = Section;

  constructor() {
    super(...arguments);
    this.containerRef = React.createRef();
  }

  render() {
    const {levels, children} = this.props;
    const classNames = makeClassNames(
      style.collapsable,
      ...levels.map(level => style[`collapse-${level}`])
    );
    const context = new CollapsableContextValue();
    context.setContainerRef(this.containerRef);

    return (
      <Context.Provider value={context}>
        <div
         ref={this.containerRef}
         className={classNames}>
          {children}
        </div>
      </Context.Provider>
    );
  }

}

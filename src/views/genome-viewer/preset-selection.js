import React from 'react';
import classNames from 'classnames';
import {matchShape, routerShape} from 'found';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';


export default class PresetSelection extends React.Component {

  static propTypes = {
    className: PropTypes.string,
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.node.isRequired
      })
    ).isRequired
  }

  handleChange = ({value}) => {
    const {match: {location}} = this.props;
    this.props.router.push(`${location.pathname}${value}/`);
  }

  render() {
    const {className, options} = this.props;
    return <section className={classNames(
      style['preset-selection'],
      className
    )}>
      <Dropdown
       placeholder="Choose a virus to view..."
       options={options}
       name="preset"
       onChange={this.handleChange} />
    </section>;
  }

}

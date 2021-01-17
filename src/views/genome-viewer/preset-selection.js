import React from 'react';
import {withRouter} from 'found';
import classNames from 'classnames';
import {matchShape, routerShape} from 'found';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';


class PresetSelection extends React.Component {

  static propTypes = {
    className: PropTypes.string,
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.node.isRequired
      }).isRequired
    ).isRequired,
    as: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.func.isRequired
    ]).isRequired
  }

  static defaultProps = {
    as: 'section'
  }

  handleChange = ({value}) => {
    const {match: {location}} = this.props;
    this.props.router.push(`${location.pathname}${value}/`);
  }

  render() {
    const {as, className, options} = this.props;
    return React.createElement(
      as,
      {
        className: classNames(
          style['preset-selection'],
          className
        )
      },
      <Dropdown
       placeholder="Choose a genome view..."
       options={options}
       name="preset"
       onChange={this.handleChange} />
    );
  }

}


export default withRouter(PresetSelection);

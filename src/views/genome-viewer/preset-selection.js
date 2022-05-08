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
  };

  static defaultProps = {
    as: 'section'
  };

  get splittedPathName() {
    let {match: {location: {pathname}}} = this.props;
    pathname = pathname.replace(/\/$/, '');
    return pathname.split('/');
  }

  get current() {
    const {options} = this.props;
    const {splittedPathName: split} = this;
    const presetName = split[split.length - 1];
    if (options.find(({value}) => value === presetName)) {
      return presetName;
    }
    return null;
  }

  handleChange = ({value}) => {
    const {options} = this.props;
    const {splittedPathName: split} = this;
    const presetName = split[split.length - 1];
    let pathname;
    if (options.find(({value}) => value === presetName)) {
      pathname = split.slice(0, split.length - 1).join('/');
    }
    else {
      pathname = split.join('/');
    }
    this.props.router.push(`${pathname}/${value}/`);
  };

  render() {
    const {current} = this;
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
       value={current}
       placeholder="Choose a genome view..."
       options={options}
       name="preset"
       onChange={this.handleChange} />
    );
  }

}


export default withRouter(PresetSelection);

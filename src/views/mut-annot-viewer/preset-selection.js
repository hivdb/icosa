import React from 'react';
import {matchShape, routerShape} from 'found';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';


export default class PresetSelection extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.node.isRequired
      })
    ).isRequired
  };

  handleChange = ({value}) => {
    const {match: {location}} = this.props;
    this.props.router.push(`${location.pathname}${value}/`);
  };

  render() {
    const {options} = this.props;
    return <section className={style['preset-selection']}>
      <Dropdown
       placeholder="Choose a gene to view..."
       options={options}
       name="preset"
       onChange={this.handleChange} />
    </section>;
  }

}

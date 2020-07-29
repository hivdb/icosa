import React from 'react';
import {routerShape} from 'found';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';


export default class PresetSelection extends React.Component {

  static propTypes = {
    router: routerShape.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.node.isRequired
      })
    ).isRequired
  }

  handleChange = ({value}) => {
    this.props.router.push(`${value}/`);
  }

  render() {
    const {options} = this.props;
    return <section className={style['preset-selection']}>
      <Dropdown
       placeholder="Choose a gene to edit..."
       options={options}
       name="preset"
       onChange={this.handleChange} />
    </section>;
  }

}

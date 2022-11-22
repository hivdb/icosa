import React from 'react';
import {matchShape, routerShape} from 'found';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';


PresetSelection.propTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired
    })
  ).isRequired
};


export default function PresetSelection({
  match: {location},
  router,
  options
}) {

  const handleChange = React.useCallback(
    ({value}) => router.push(`${location.pathname}${value}/`),
    [router, location]
  );

  return <section className={style['preset-selection']}>
    <Dropdown
     placeholder="Choose a gene to view..."
     options={options}
     name="preset"
     onChange={handleChange} />
  </section>;

}

import React from 'react';
import PropTypes from 'prop-types';

import {
  fastpConfigShape,
  defaultFastpConfig,
  cutadaptConfigShape,
  defaultCutadaptConfig,
  ivarConfigShape,
  defaultIvarConfig
} from './prop-types';

import style from './style.module.scss';
import AdapterTrimmingSwitch from './adapter-trimming-switch';


NGSOptionsForm.propTypes = {
  fastpConfig: fastpConfigShape.isRequired,
  cutadaptConfig: cutadaptConfigShape.isRequired,
  ivarConfig: ivarConfigShape.isRequired,
  onChange: PropTypes.func.isRequired
};

NGSOptionsForm.defaultProps = {
  fastpConfig: {...defaultFastpConfig},
  cutadaptConfig: {...defaultCutadaptConfig},
  ivarConfig: {...defaultIvarConfig}
};


export default function NGSOptionsForm({
  fastpConfig: {
    disableAdapterTrimming
  },
  onChange
}) {

  return <form className={style['ngs-options-form']}>
    <fieldset>
      <AdapterTrimmingSwitch
       {...{
         disableAdapterTrimming,
         onChange
       }} />
    </fieldset>
  </form>;
}

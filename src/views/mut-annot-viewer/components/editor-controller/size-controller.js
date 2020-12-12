import React from 'react';
import PropTypes from 'prop-types';
import capitalize from 'lodash/capitalize';

import style from './style.module.scss';

import Button from '../../../../components/button';
import {seqViewerSizeType} from '../../prop-types';


export default class SizeController extends React.Component {

  static propTypes = {
    allowEditing: PropTypes.bool.isRequired,
    size: seqViewerSizeType.isRequired,
    onChange: PropTypes.func.isRequired
  }

  handleChange = ({currentTarget: {value}}) => {
    this.props.onChange(value);
  }

  render() {
    const {
      allowEditing,
      size: seqViewerSize
    } = this.props;

    return (
      <div className={style['input-group']}>
        <h3>{allowEditing ? 'Editor' : 'Viewer'} size:</h3>
        <div className={style['inline-buttons']}>
          {['large', 'middle', 'small'].map(size => (
            <Button
             key={size}
             name="size"
             btnStyle={size === seqViewerSize ? 'primary' : 'light'}
             onClick={this.handleChange}
             value={size}>
              {capitalize(size)}
            </Button>
          ))}
        </div>
      </div>
    );
  }

}

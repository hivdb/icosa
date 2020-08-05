import React from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';
import {FaDownload} from 'react-icons/fa';

import Button from '../../../../components/button';
import {makeDownload} from '../../../../utils/download';

import {
  posShape, citationShape,
  annotShape
} from '../../prop-types';

import style from './style.module.scss';


export default class EditorMenu extends React.Component {

  static propTypes = {
    gene: PropTypes.string.isRequired,
    taxonomy: PropTypes.string.isRequired,
    annotations: PropTypes.arrayOf(annotShape.isRequired).isRequired,
    positions: PropTypes.arrayOf(posShape.isRequired).isRequired,
    citations: PropTypes.objectOf(citationShape.isRequired).isRequired,
    changed: PropTypes.bool.isRequired,
    onRevertAll: PropTypes.func.isRequired,
    className: PropTypes.string
  }

  handleRevertAll = () => {
    this.props.onRevertAll();
  }

  handleSaveToLocal = () => {
    const {gene, taxonomy, annotations, positions, citations} = this.props;
    let data = JSON.stringify({
      gene, taxonomy, annotations, citations, positions
    }, null, '  ');
    data = data.replace(/[\u007F-\uFFFF]/g, (chr) => (
      "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
    ));
    makeDownload(
      `mutation-annotations_${gene}.json`,
      'application/json',
      data);
  }

  render() {
    const {className, changed} = this.props;

    return (
      <nav className={makeClassNames(style['editor-menu'], className)}>
        <ul className={style['editor-menu-items']}>
          <li>
            <Button
             name="save"
             btnStyle="primary"
             disabled={!changed}
             onClick={this.handleSaveToLocal}>
              <FaDownload className={style['btn-icon']} /> Save JSON
            </Button>
          </li>
          <li>
            <Button
             name="revert"
             btnStyle="light"
             disabled={!changed}
             onClick={this.handleRevertAll}>
              Revert all changes
            </Button>
          </li>
        </ul>
      </nav>
    );

  }



}

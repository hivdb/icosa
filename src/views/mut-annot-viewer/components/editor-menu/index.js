import React from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';
import {FaDownload} from 'react-icons/fa';

import Button from '../../../../components/button';
import CheckboxInput from '../../../../components/checkbox-input';
import {makeDownload} from '../../../../utils/download';

import {
  posShape, citationShape,
  annotCategoryShape, annotShape,
  versionType
} from '../../prop-types';

import style from './style.module.scss';


export default class EditorMenu extends React.Component {

  static propTypes = {
    version: versionType.isRequired,
    gene: PropTypes.string.isRequired,
    taxonomy: PropTypes.string.isRequired,
    annotCategories: PropTypes.arrayOf(
      annotCategoryShape.isRequired
    ).isRequired,
    annotations: PropTypes.arrayOf(annotShape.isRequired).isRequired,
    positions: PropTypes.arrayOf(posShape.isRequired).isRequired,
    citations: PropTypes.objectOf(citationShape.isRequired).isRequired,
    changed: PropTypes.bool.isRequired,
    onRevertAll: PropTypes.func.isRequired,
    onToggleAllowEditing: PropTypes.func.isRequired,
    allowEditing: PropTypes.bool.isRequired,
    className: PropTypes.string
  }

  handleRevertAll = () => {
    this.props.onRevertAll();
  }

  handleSaveToLocal = () => {
    const {
      version, gene, taxonomy, annotCategories,
      annotations, positions, citations
    } = this.props;
    let data = JSON.stringify({
      version, gene, taxonomy, annotCategories,
      annotations, citations, positions
    }, null, '  ');
    data = data.replace(/[\u007F-\uFFFF]/g, (chr) => (
      "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
    ));
    makeDownload(
      `mutation-annotations_${gene}.json`,
      'application/json',
      data);
  }

  handleToggleAllowEditing = ({currentTarget: {checked}}) => {
    this.props.onToggleAllowEditing(checked);
  }

  render() {
    const {className, allowEditing, changed} = this.props;

    return (
      <nav className={makeClassNames(style['editor-menu'], className)}>
        <ul className={style['editor-menu-items']}>
          {allowEditing ? <>
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
          </> : null}
          <li className={style['pull-right']}>
            <CheckboxInput
             name="edit-mode"
             id="edit-mode-toggler"
             value=""
             onChange={this.handleToggleAllowEditing}
             checked={allowEditing}>
              Allow editing
            </CheckboxInput>
          </li>
        </ul>
      </nav>
    );

  }

}

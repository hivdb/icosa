import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';
import {FaPlus, FaAngleUp, FaRegEdit} from 'react-icons/fa';

import Button from '../../../../components/button';
import RadioInput from '../../../../components/radio-input';

import {annotShape} from '../../prop-types';

import style from './style.module.scss';


export default class AnnotationFilter extends React.Component {

  static propTypes = {
    annotations: PropTypes.arrayOf(
      annotShape.isRequired
    ).isRequired,
    curAnnot: annotShape,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
  }

  static getDerivedStateFromProps(props, state = {}) {
    const {
      annotations,
      curAnnot: {
        name: curAnnotName,
        level: curAnnotLevel
      } = {}
    } = props;
    if (
      state.curAnnotName === curAnnotName &&
      state.curAnnotLevel === curAnnotLevel &&
      state.annotations === annotations
    ) {
      return null;
    }
    return {
      curAnnotName,
      curAnnotLevel,
      annotations,
      inputExpanded: false,
      editMode: null,
      editAnnotName: null,
      editAnnotLevel: null,
      warningText: null
    };
  }

  constructor() {
    super(...arguments);
    this.state = this.constructor.getDerivedStateFromProps(this.props);
  }

  get curAnnotName() {
    const {curAnnot: {name} = {}} = this.props;
    return name;
  }

  get options() {
    const {annotations} = this.props;
    return annotations.map(({name}) => name);
  }

  get canSave() {
    const {editAnnotName, editAnnotLevel} = this.state;
    return !!editAnnotName && !!editAnnotLevel;
  }

  handleChange = ({value}) => {
    const {annotations, onChange} = this.props;
    for (const annot of annotations) {
      if (annot.name === value) {
        onChange(annot);
      }
    }
  }

  handleEditName = ({currentTarget: {value}}) => {
    this.setState({editAnnotName: value});
  }

  handleEditLevel = ({currentTarget: {value, checked}}) => {
    if (checked) {
      this.setState({editAnnotLevel: value});
    }
  }

  toggle(editMode) {
    return () => {
      const {curAnnot: {
        name: annotName,
        level: annotLevel
      } = {}} = this.props;
      const {inputExpanded} = this.state;
      this.setState({
        inputExpanded: !inputExpanded,
        editMode: inputExpanded ? null : editMode,
        editAnnotName: editMode === 'edit' ? annotName : '',
        editAnnotLevel: editMode === 'edit' ? annotLevel : null
      });
    };
  }

  handleSave = () => {
    const {editMode, editAnnotName, editAnnotLevel} = this.state;
    const {
      onSave,
      annotations,
      curAnnot: {name: curAnnotName} = {}
    } = this.props;
    const origAnnotName = editMode === 'add' ? null : curAnnotName;
    if (
      editMode === 'add' &&
      annotations.some(({name}) => name === editAnnotName)
    ) {
      this.setState({
        warningText: (
          `Unable to create annotation group "${editAnnotName}" ` +
          'since it is already exists.'
        )
      });
      return;
    }
    onSave({
      action: 'editAnnotation',
      origAnnotName,
      newAnnotName: editAnnotName,
      newAnnotLevel: editAnnotLevel
    });
  }

  handleDelete = () => {
    const {onSave, curAnnot: {name: annotName} = {}} = this.props;
    const flag = window.confirm(
      `Click "OK" to confirm deleting annotation group "${annotName}".`
    );
    if (!flag) {
      return;
    }
    onSave({
      action: 'removeAnnotation',
      annotName
    });
  }

  handleCancel = () => {
    this.setState(
      this.constructor.getDerivedStateFromProps(this.props)
    );
  }

  render() {
    const {options, curAnnotName} = this;
    const {
      inputExpanded, editMode,
      editAnnotName, editAnnotLevel,
      warningText
    } = this.state;
    const AddIcon = editMode === 'add' ? FaAngleUp : FaPlus;
    const EditIcon = editMode === 'edit' ? FaAngleUp : FaRegEdit;

    return (
      <div className={style['input-group']}>
        <label htmlFor="annotation">Annotation group:</label>
        <Dropdown
         value={curAnnotName}
         options={options}
         name="annotation"
         className={style['dropdown-annotations']}
         onChange={this.handleChange} />
        <Button
         disabled={editMode === 'edit'}
         name="expand-add-annotation"
         btnStyle="primary"
         className={style['edit-annotation']}
         title="Create a new annotation group"
         onClick={this.toggle('add')}>
          <AddIcon className={style['btn-icon']} />
        </Button>
        <Button
         disabled={editMode === 'add' || !this.props.curAnnot}
         name="expand-edit-annotation"
         btnStyle="light"
         className={style['edit-annotation']}
         title="Edit current annotation gorup"
         onClick={this.toggle('edit')}>
          <EditIcon className={style['btn-icon']} />
        </Button>
        {inputExpanded ? (
          <div className={style.dialog}>
            <p>
              {editMode === 'add' ?
                'Creating a new annotation group:' :
                'Editing selected annotation group:'}
            </p>
            <input
             type="text"
             name="edit-annot-name"
             value={editAnnotName}
             className={style['text-input']}
             onChange={this.handleEditName}
             placeholder="Annotation group name" />
            <p>
              This group is for:{editMode === 'edit' ? ' (read-only)' : null}
            </p>
            <RadioInput
             id="edit-annot-level-pos"
             name="edit-annot-level"
             checked={editAnnotLevel === 'position'}
             onChange={this.handleEditLevel}
             disabled={editMode === 'edit'}
             value="position">
              Position annotation
            </RadioInput>
            <RadioInput
             id="edit-annot-level-aa"
             name="edit-annot-level"
             checked={editAnnotLevel === 'amino acid'}
             onChange={this.handleEditLevel}
             disabled={editMode === 'edit'}
             value="amino acid">
              Amino acid annotation
            </RadioInput>
            {warningText ?
              <div className={style['warning']}>{warningText}</div> : null}
            <div className={style['inline-buttons']}>
              <Button
               name="save"
               btnStyle="primary"
               disabled={!this.canSave}
               onClick={this.handleSave}>
                Save
              </Button>
              <Button
               name="cancel"
               btnStyle="light"
               onClick={this.handleCancel}>
                Cancel
              </Button>
              {editMode === 'edit' && curAnnotName === editAnnotName ?
                <Button
                 name="remove-group"
                 btnStyle="link"
                 onClick={this.handleDelete}>
                  Remove group
                </Button> : null}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

}

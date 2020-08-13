import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';
import {FaPlus, FaAngleUp, FaRegEdit} from 'react-icons/fa';

import Button from '../../../../components/button';
import RadioInput from '../../../../components/radio-input';
import CheckboxInput from '../../../../components/checkbox-input';

import {annotShape} from '../../prop-types';

import style from './style.module.scss';


export default class AnnotationFilter extends React.Component {

  static propTypes = {
    allowEditing: PropTypes.bool.isRequired,
    annotations: PropTypes.arrayOf(
      annotShape.isRequired
    ).isRequired,
    extraAnnots: PropTypes.arrayOf(
      annotShape.isRequired
    ).isRequired,
    curAnnot: annotShape,
    onChange: PropTypes.func.isRequired,
    onExtraAnnotsChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
  }

  static getDerivedStateFromProps(props, state = {}) {
    const {
      annotations,
      curAnnot: {
        name: curAnnotName,
        level: curAnnotLevel,
        hideCitations: curAnnotHideCitations,
        colorRules: curAnnotColorRules
      } = {}
    } = props;
    if (
      state.curAnnotName === curAnnotName &&
      state.curAnnotLevel === curAnnotLevel &&
      state.curAnnotHideCitations === curAnnotHideCitations &&
      JSON.stringify(state.curAnnotColorRules) ===
      JSON.stringify(curAnnotColorRules) &&
      state.annotations === annotations
    ) {
      return null;
    }
    return {
      curAnnotName,
      curAnnotLevel,
      curAnnotHideCitations,
      curAnnotColorRules,
      annotations,
      inputExpanded: false,
      editMode: null,
      editAnnotName: '',
      editAnnotLevel: null,
      editHideCitations: null,
      editColorRules: '[]',
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
  
  handleAddExtraAnnot = ({value}) => {
    const {
      extraAnnots,
      annotations,
      onExtraAnnotsChange
    } = this.props;
    if (extraAnnots.some(({name}) => name === value)) {
      return;
    }
    for (const annot of annotations) {
      if (annot.name === value) {
        extraAnnots.push(annot);
        onExtraAnnotsChange(extraAnnots);
        break;
      }
    }
  }

  handleRemoveExtraAnnot(removeName) {
    return (evt) => {
      evt.preventDefault();
      const {
        extraAnnots,
        onExtraAnnotsChange
      } = this.props;
      const newExtraAnnots = extraAnnots.filter(
        ({name}) => name !== removeName
      );
      if (extraAnnots.length > newExtraAnnots.length) {
        onExtraAnnotsChange(newExtraAnnots);
      }
    };
  }

  handleEditName = ({currentTarget: {value}}) => {
    this.setState({editAnnotName: value});
  }

  handleEditLevel = ({currentTarget: {value, checked}}) => {
    if (checked) {
      this.setState({editAnnotLevel: value});
    }
  }

  handleToggleHideCitations = ({currentTarget: {checked}}) => {
    this.setState({editHideCitations: checked});
  }
  
  handleChangeColorRules = ({currentTarget: {value}}) => {
    this.setState({editColorRules: value});
  }

  toggle(editMode) {
    return () => {
      const {curAnnot: {
        name: annotName,
        level: annotLevel,
        hideCitations = false,
        colorRules = []
      } = {}} = this.props;
      const {inputExpanded} = this.state;
      this.setState({
        inputExpanded: !inputExpanded,
        editMode: inputExpanded ? null : editMode,
        editAnnotName: editMode === 'edit' ? annotName : '',
        editAnnotLevel: editMode === 'edit' ? annotLevel : null,
        editHideCitations: editMode === 'edit' ? hideCitations : null,
        editColorRules: editMode === 'edit' ?
          JSON.stringify(colorRules, null, '  ') : null
      });
    };
  }

  handleSave = () => {
    const {
      editMode, editAnnotName,
      editAnnotLevel, editHideCitations,
      editColorRules
    } = this.state;
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
    let newColorRules;
    try {
      newColorRules = JSON.parse(editColorRules);
    }
    catch (error) {
      this.setState({
        warningText: (
          `The text of coloring rules is not in valid JSON format: ${error}`
        )
      });
      return;
    }
    for (const rule of newColorRules) {
      try {
        new RegExp(rule);
      }
      catch (error) {
        this.setState({warningText: `${error}`});
      }
    }
    onSave({
      action: 'editAnnotation',
      origAnnotName,
      newAnnotName: editAnnotName,
      newAnnotLevel: editAnnotLevel,
      newHideCitations: editHideCitations,
      newColorRules
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
      editHideCitations, editColorRules,
      warningText
    } = this.state;
    const {allowEditing, extraAnnots} = this.props;
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
        {allowEditing && <>
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
        </>}
        <br /><br />
        <p>
          {allowEditing ? 'Default a' : 'A'}
          dditional annotation groups:
        </p>
        <ul>
          {extraAnnots.map(({name}) => (
            <li key={name}>
              {name} (
              <a
               href="#remove-extra-annot"
               onClick={this.handleRemoveExtraAnnot(name)}>
                remove
              </a>)
            </li>
          ))}
        </ul>
        <Dropdown
         value={null}
         options={options}
         name="annotation"
         className={style['dropdown-annotations']}
         onChange={this.handleAddExtraAnnot} />
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
            <p>
              Annotation group config:
            </p>
            <CheckboxInput
             id="edit-hide-citations"
             name="edit-hide-citations"
             checked={editHideCitations}
             onChange={this.handleToggleHideCitations}
             value="">
              Hide citations
            </CheckboxInput>
            <p>
              Custom color rules: (array of regular expressions,
              see an example after the textarea)
            </p>
            <textarea
             id="edit-color-rules"
             name="edit-color-rules"
             className={style.textarea}
             onChange={this.handleChangeColorRules}
             value={editColorRules} />
            <pre>{`["^β", "^T$", "^α", "^η", "^π"]`}</pre>
            {warningText ?
              <div className={style['warning']}>{warningText}</div> : null}
            <p />
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

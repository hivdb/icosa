import React from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';
import {FaSyncAlt} from 'react-icons/fa';

import Button from '../../../../components/button';
import ExtLink from '../../../../components/link/external';
import CheckboxInput from '../../../../components/checkbox-input';
import {citationShape} from '../../prop-types';

import style from './style.module.scss';


function CitationCheckbox(props) {
  const {citeId, onChange, onEdit, citations, displayCitationIds} = props;
  return (
    <CheckboxInput
     name="display-citations"
     id={`display-citations-${citeId}`}
     onChange={onChange}
     className={style['citation-checkbox']}
     checked={displayCitationIds.includes(citeId)}
     value={citeId}>
      {(() => {
        const {author, year, doi, section} = citations[citeId];
        return <>
          {author} {year} (
          <ExtLink href={`https://doi.org/${doi}`}>paper</ExtLink>{', '}
          <a href="#edit-citation" onClick={handleEdit(citeId)}>edit</a>
          )
          <span className={style['citation-section']}>
            {section}
          </span>
        </>;
      })()}
    </CheckboxInput>
  );

  function handleEdit(citeId) {
    return evt => {
      evt.preventDefault();
      onEdit({...citations[citeId], citeId});
    };
  }
}


function crossrefExtractYear(message) {
  for (const key of ['published-print', 'created', 'issued']) {
    if (key in message) {
      const pubdate = message[key]['date-time'];
      if (pubdate && pubdate.length > 0) {
        try {
          const date = new Date(pubdate);
          return date.getFullYear();
        }
        catch (error) {
          continue;
        }
      }
    }
  }
  return '';
}


function crossrefExtractAuthor(message) {
  if (!('author' in message)) {
    return '';
  }
  for (const {family} of message.author) {
    return family;
  }
  return '';
}


export default class CitationFilter extends React.Component {

  static propTypes = {
    citations: PropTypes.objectOf(citationShape.isRequired).isRequired,
    referredCitationIds: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    displayCitationIds: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    useInputGroup: PropTypes.bool.isRequired
  }

  static defaultProps = {
    useInputGroup: true
  }

  static getDerivedStateFromProps(props, state = {}) {
    const {
      citations,
      referredCitationIds,
      displayCitationIds
    } = props;
    if (
      state.citations === citations &&
      state.referredCitationIds === referredCitationIds &&
      state.displayCitationIds === displayCitationIds
    ) {
      return null;
    }
    let inputExpanded = false, editMode = null;
    if (referredCitationIds.length === 0) {
      inputExpanded = true;
      editMode = 'add';
    }
    return {
      citations,
      referredCitationIds,
      displayCitationIds,
      inputExpanded,
      editMode,
      editCiteId: '',
      editAuthor: '',
      editYear: '',
      editDOI: '',
      editSection: '',
      editDOIValid: false,
      fetchingDOI: false
    };
  }

  constructor() {
    super(...arguments);
    this.state = this.constructor.getDerivedStateFromProps(this.props);
  }

  get canSave() {
    const {editAuthor, editYear, editDOI, editSection} = this.state;
    return !!editAuthor && !!editYear && !!editDOI && !!editSection;
  }

  handleSelectAll = (evt) => {
    evt.preventDefault();
    this.props.onChange(this.props.referredCitationIds);
  }

  handleDeselectAll = (evt) => {
    evt.preventDefault();
    this.props.onChange([]);
  }

  handleChange = ({currentTarget: {value, checked}}) => {
    let {displayCitationIds} = this.props;
    if (checked) {
      // add
      displayCitationIds.push(value);
    }
    else {
      // remove
      displayCitationIds = displayCitationIds.filter(cid => cid !== value);
    }
    this.props.onChange(displayCitationIds);
  }

  handleSave = () => {
    const {editCiteId, editDOI, editAuthor, editYear, editSection} = this.state;
    this.props.onSave({
      action: 'editCitation',
      citeId: editCiteId,
      doi: editDOI,
      author: editAuthor,
      year: editYear,
      section: editSection
    });
  }

  handleCancel = () => {
    this.setState(
      this.constructor.getDerivedStateFromProps(this.props)
    );
  }

  handleDelete = () => {
  }

  handleEditClick = ({citeId, author, year, doi, section}) => {
    this.setState({
      inputExpanded: true,
      editMode: 'edit',
      editCiteId: citeId,
      editAuthor: author,
      editYear: year,
      editDOI: doi,
      editDOIValid: true,
      editSection: section
    });
  }

  handleAddClick = () => {
    this.setState({
      inputExpanded: true,
      editMode: 'add',
      editCiteId: '',
      editAuthor: '',
      editYear: '',
      editDOI: '',
      editDOIValid: false,
      editSection: ''
    });
  }

  handleEditChange = ({currentTarget: {name, value}}) => {
    if (name === 'editYear' && value) {
      value = parseInt(value);
      if (isNaN(value)) {
        return;
      }
      if (value < 0 || value > new Date().getFullYear() + 1) {
        return;
      }
    }
    const state = {};
    state[name] = value;
    this.setState(state);
  }

  handleFetchDOI = async () => {
    let {editDOI, editAuthor, editYear} = this.state;
    if (!editDOI) {
      return;
    }
    this.setState({fetchingDOI: true});
    let resp;
    try {
      resp = await fetch(`https://api.crossref.org/works/${editDOI}`);
      if (!resp.ok) {
        return;
      }
      const data = await resp.json();
      if (data.status !== 'ok') {
        return;
      }
      editAuthor = crossrefExtractAuthor(data.message);
      editYear = crossrefExtractYear(data.message);
      this.setState({
        editDOIValid: true,
        editAuthor,
        editYear
      });
    }
    catch (error) {
      console.warn(error);
      return;
    }
    finally {
      this.setState({fetchingDOI: false});
    }
  }

  render() {
    const {
      referredCitationIds,
      displayCitationIds,
      useInputGroup,
      citations
    } = this.props;
    const {
      inputExpanded,
      editMode,
      editAuthor,
      editYear,
      editDOI,
      editSection,
      editDOIValid,
      fetchingDOI
    } = this.state;

    const inner = referredCitationIds.map(citeId => (
      <CitationCheckbox
       key={citeId}
       citeId={citeId}
       onChange={this.handleChange}
       onEdit={this.handleEditClick}
       citations={citations}
       displayCitationIds={displayCitationIds} />
    ));
    const addCitationText = (
      editMode === 'add' ?
        'Cancel add citation' :
        'Add citation'
    );

    if (useInputGroup) {
      return (
        <div className={style['input-group']}>
          {referredCitationIds.length > 0 ? (
            <label>
              Citations:
            </label>
          ) : null}
          {inner}
          {referredCitationIds.length > 0 ? (
            <div className={style['inline-buttons']}>
              <Button
               name="add-citation"
               btnStyle="light"
               title="Add a new citation"
               disabled={editMode === 'edit'}
               onClick={
                 editMode === 'add' ?
                   this.handleCancel :
                   this.handleAddClick
               }>
                {addCitationText}
              </Button>
              <Button
               name="select-all"
               btnStyle="link"
               onClick={this.handleSelectAll}>
                Select all
              </Button>
              <Button
               name="deselect-all"
               btnStyle="link"
               onClick={this.handleDeselectAll}>
                Deselect all
              </Button>
            </div>
          ) : null}
          {inputExpanded ? (
            <div className={style.dialog}>
              <p>
                {editMode === 'add' ?
                  'Adding a new citation:' :
                  'Editing selected citation:'}
              </p>
              <div className={style['labeled-input']}>
                <label htmlFor="editDOI">DOI</label>
                <input
                 type="text"
                 name="editDOI"
                 placeholder="10.xxxx/yyyy.zzzz"
                 disabled={editMode === 'edit'}
                 value={editDOI}
                 onChange={this.handleEditChange}
                 className={makeClassNames(
                   style['text-input'], style['with-refresh-btn']
                 )} />
                <Button
                 disabled={!editDOI || fetchingDOI}
                 name="refresh-author-year"
                 btnStyle="primary"
                 className={style['refresh']}
                 title="Synchronize author/year information from CrossRef.org"
                 onClick={this.handleFetchDOI}>
                  <FaSyncAlt className={style['btn-icon']} />
                </Button>
                {editDOIValid ?
                  <div className={style['input-note']}>
                    <ExtLink href={`https://doi.org/${editDOI}`}>
                      open paper in new window
                    </ExtLink>
                  </div> : null}
              </div>
              <div className={style['labeled-input']}>
                <label htmlFor="editAuthor">Author</label>
                <input
                 type="text"
                 name="editAuthor"
                 placeholder="First author last name"
                 value={editAuthor}
                 onChange={this.handleEditChange}
                 disabled={fetchingDOI}
                 className={style['text-input']} />
              </div>
              <div className={style['labeled-input']}>
                <label htmlFor="editYear">Year</label>
                <input
                 type="text"
                 name="editYear"
                 placeholder="Publication year"
                 value={editYear}
                 onChange={this.handleEditChange}
                 disabled={fetchingDOI}
                 className={style['text-input']} />
              </div>
              <div className={style['labeled-input']}>
                <label htmlFor="editSection">Section</label>
                <input
                 type="text"
                 name="editSection"
                 placeholder="Figure X / Table X / Results section"
                 value={editSection}
                 onChange={this.handleEditChange}
                 className={style['text-input']} />
              </div>
              {referredCitationIds.length === 0 ?
                <p className={style.warning}>
                  At least one citation is required for adding
                  new annotations.
                </p> : null}
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
                {editMode === 'edit' ?
                  <Button
                   name="remove-citation"
                   btnStyle="link"
                   onClick={this.handleDelete}>
                    Remove citation
                  </Button> : null}
              </div>
            </div>
          ) : null}
        </div>
      );
    }
    else {
      return inner;
    }
  }

}

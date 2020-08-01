import React from 'react';
import PropTypes from 'prop-types';

import ExtLink from '../../../../components/link/external';
import CheckboxInput from '../../../../components/checkbox-input';
import {citationShape} from '../../prop-types';

import style from './style.module.scss';


function CitationCheckbox(props) {
  const {citeId, onChange, citations, displayCitationIds} = props;
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
          <ExtLink href={`https://doi.org/${doi}`}>paper</ExtLink>
          )
          <span className={style['citation-section']}>
            {section}
          </span>
        </>;
      })()}
    </CheckboxInput>
  );
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
    useInputGroup: PropTypes.bool.isRequired
  }

  static defaultProps = {
    useInputGroup: true
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

  render() {
    const {
      referredCitationIds,
      displayCitationIds,
      useInputGroup,
      citations
    } = this.props;

    const inner = referredCitationIds.map(citeId => (
      <CitationCheckbox
       key={citeId}
       citeId={citeId}
       onChange={this.handleChange}
       citations={citations}
       displayCitationIds={displayCitationIds} />
    ));

    if (useInputGroup) {
      return (
        <div className={style['input-group']}>
          <label>
            Citation filter (
            <a href="#select-all" onClick={this.handleSelectAll}>
              select all
            </a>
            {', '}
            <a href="#deselect-all" onClick={this.handleDeselectAll}>
              deselect all
            </a>
            ):
          </label>
          {inner}
        </div>
      );
    }
    else {
      return inner;
    }
  }

}

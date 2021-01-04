import React from 'react';

export default function buildRef(props) {
  let {
    authors, title, journal, year, medlineId, url, children
  } = props;
  if (children) {
    if (children.length === 1 && children[0].type === 'p') {
      children = children[0].props.children;
    }
  }
  else {
    if (medlineId) {
      url = `https://www.ncbi.nlm.nih.gov/pubmed/${medlineId}`;
    }
    children = <>
      {authors}. {title}.{' '}
      <a href={url} rel="noopener noreferrer" target="_blank">
        {journal} {year}
      </a>.
    </>;
  }
  return children;
}

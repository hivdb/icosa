import React, {ReactNode} from 'react';

export interface BuildRefProps {
  authors?: ReactNode;
  title?: ReactNode;
  journal?: ReactNode;
  year?: ReactNode;
  medlineId?: string;
  url?: string;
  children?: ReactNode;
}

/**
 * Builds a formatted reference entry.
 *
 * When `children` is provided it will be returned directly. Otherwise a
 * fallback layout containing authors, title and a journal link is rendered.
 * The `medlineId` property will override `url` with a link to PubMed.
 *
 * @param authors - author names
 * @param title - reference title
 * @param journal - journal name
 * @param year - publication year
 * @param medlineId - optional PubMed identifier
 * @param url - URL of the reference (used when `medlineId` is absent)
 * @param children - custom content to render instead of the default layout
 */
export default function buildRef({
  authors,
  title,
  journal,
  year,
  medlineId,
  url,
  children
}: BuildRefProps): ReactNode {
  let content = children;
  if (content) {
    if (Array.isArray(content) && content.length === 1 &&
      (content[0] as any).type === 'p') {
      content = (content[0] as any).props.children;
    }
  }
  else {
    if (medlineId) {
      url = `https://www.ncbi.nlm.nih.gov/pubmed/${medlineId}`;
    }
    content = <>
      {authors}. {title}.{' '}
      <a href={url} rel="noopener noreferrer" target="_blank">
        {journal} {year}
      </a>.
    </>;
  }
  return content as ReactNode;
}


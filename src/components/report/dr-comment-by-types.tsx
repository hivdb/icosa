import React from 'react';
import reEscape from 'escape-string-regexp';

import Markdown from '../markdown';
import ConfigContext from '../../utils/config-context';

import style from './style.module.scss';

/**
 * Highlight mutation names within a comment string using Markdown bold syntax.
 * Mutation names are escaped for regex safety and support patterns like A23B.
 */
function highlight(comment: string, highlightText: string[]): string {
  let hls = highlightText.map(hl => {
    hl = reEscape(hl);
    hl = hl.replace(/^([A-Z])(\d+)([A-Z]+)$/, '\\b$1$2\\S*[$3]\\S*\\b');
    return hl;
  }).join('|');
  hls = new RegExp(`(${hls})`, 'g');
  return comment.replaceAll(hls, '**$1**');
}

interface MutationComment {
  name: string;
  text: string;
  highlightText: string[];
}

interface CommentByType {
  commentType: string;
  comments: MutationComment[];
}

interface DRCommentByTypesProps {
  gene: {name: string};
  commentsByTypes: CommentByType[];
  disabledDrugs?: string[];
}

/**
 * Render drug-resistance comments grouped by mutation types for a gene.
 */
export default function DRCommentByTypes({
  gene,
  commentsByTypes,
  disabledDrugs = []
}: DRCommentByTypesProps) {
  if (commentsByTypes.every(({comments}) => comments.length === 0)) {
    return null;
  }
  const displayTPV = !disabledDrugs.includes('TPV');
  const [config] = ConfigContext.use();
  const {mutationTypesByGenes} = config || {};

  return (
    <div className={style['dr-report-comment-by-types']}>
      <div className={style.title}>{gene.name} comments</div>
      <dl>
        {commentsByTypes
          .filter(({comments}) => !(
            comments.length === 0 ||
            (displayTPV && comments.every(({name}) => name.startsWith('DRVHighAndTPV')))
          ))
          .map(({commentType, comments}) => [
            <dt key={`label-${commentType}`}>
              {mutationTypesByGenes?.[gene.name]?.[commentType] ?? commentType}
            </dt>,
            <dd key={`list-${commentType}`}>
              <ul>
                {(() => {
                  let commentsByText: Record<string, MutationComment[]> = {};
                  for (const cmt of comments) {
                    // regroup mutations by same comment text
                    if (displayTPV && cmt.name.startsWith('DRVHighAndTPV')) {
                      continue;
                    }
                    if (!commentsByText[cmt.text]) {
                      commentsByText[cmt.text] = [];
                    }
                    commentsByText[cmt.text].push(cmt);
                  }
                  return Object.values(commentsByText).map((cmts, idx) => (
                    <li key={idx}>
                      <Markdown inline escapeHtml={false} displayReferences={false}>
                        {highlight(
                          cmts[0].text,
                          cmts.reduce((l, cmt) => l.concat(cmt.highlightText), [])
                        )}
                      </Markdown>
                    </li>
                  ));
                })()}
              </ul>
            </dd>
          ])}
      </dl>
    </div>
  );
}

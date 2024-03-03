import React from 'react';
import PropTypes from 'prop-types';
import reEscape from 'escape-string-regexp';

import Markdown from '../markdown';
import ConfigContext from '../../utils/config-context';

import style from './style.module.scss';


function highlight(key, comment, highlightText) {
  let hls = highlightText.map(hl => {
    hl = reEscape(hl);
    hl = hl.replace(/^([A-Z])(\d+)([A-Z]+)$/, '\\b$1$2\\S*[$3]\\S*\\b');
    return hl;
  }).join('|');
  hls = new RegExp(`(${hls})`, 'g');
  return comment.replaceAll(hls, '**$1**');
}


DRCommentByTypes.propTypes = {
  gene: PropTypes.object.isRequired,
  commentsByTypes: PropTypes.array.isRequired,
  disabledDrugs: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired
};

DRCommentByTypes.defaultProps = {
  disabledDrugs: []
};

export default function DRCommentByTypes({
  gene,
  commentsByTypes,
  disabledDrugs
}) {
  if (commentsByTypes.every(({comments}) => comments.length === 0)) {
    return null;
  }
  const displayTPV = disabledDrugs.indexOf('TPV') === -1;

  return (
    <ConfigContext.Consumer>
      {({mutationTypesByGenes}) => (
        <div className={style['dr-report-comment-by-types']}>
          <div className={style.title}>
            {gene.name} comments
          </div>
          <dl>
            {commentsByTypes
              .filter(({comments}) => (
                !(comments.length === 0 ||
               (displayTPV && comments.every(
                 ({name}) => name.startsWith('DRVHighAndTPV')
               )
               ))
              ))
              .map(({commentType, comments}, idx) => [
                <dt key={`label-${commentType}`}>
                  {mutationTypesByGenes?.[gene.name]?.[commentType] ?? commentType}
                </dt>,
                <dd key={`list-${commentType}`}>
                  <ul>
                    {(() => {
                      let commentsByText = {};
                      for (const cmt of comments) {
                        // regroup mutations by same comment text
                        if (
                          displayTPV &&
                          cmt.name.startsWith('DRVHighAndTPV')
                        ) {
                          continue;
                        }
                        if (!commentsByText[cmt.text]) {
                          commentsByText[cmt.text] = [];
                        }
                        commentsByText[cmt.text].push(cmt);
                      }
                      commentsByText = Object.values(commentsByText);
                      return commentsByText.map((cmts, idx) => (
                        <li key={idx}>
                          <Markdown inline escapeHtml={false} displayReferences={false}>
                            {highlight(
                              idx,
                              cmts[0].text,
                              cmts.reduce((l, cmt) => (
                                l.concat(cmt.highlightText)
                              ), [])
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
      )}
    </ConfigContext.Consumer>
  );
}

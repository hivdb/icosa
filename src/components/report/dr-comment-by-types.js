import React from 'react';
import PropTypes from 'prop-types';
import reEscape from 'escape-string-regexp';

import ConfigContext from '../../utils/config-context';

import style from './style.module.scss';


function highlight(key, comment, highlightText) {
  let hls = highlightText.map(hl => {
    hl = reEscape(hl);
    hl = hl.replace(/^([A-Z])(\d+)([A-Z]+)$/, '\\b$1$2\\S*[$3]\\S*\\b');
    return hl;
  }).join('|');
  hls = new RegExp(hls, 'g');
  let match, lastIndex, j=0;
  const rcomment = [];
  do {
    match = hls.exec(comment);
    if (match) {
      let idx = match.index;
      match = match[0];
      rcomment.push(comment.slice(lastIndex, idx));
      rcomment.push(<strong key={`${key}-${j++}`}>{match}</strong>);
      lastIndex = hls.lastIndex;
    }
  } while(match);
  rcomment.push(comment.slice(lastIndex));
  return rcomment;
}


export default class DRCommentByTypes extends React.Component {

  static propTypes = {
    gene: PropTypes.object.isRequired,
    commentsByTypes: PropTypes.array.isRequired,
    disabledDrugs: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired
  }

  static defaultProps = {
    disabledDrugs: []
  }

  render() {
    let {gene, commentsByTypes, disabledDrugs} = this.props;
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
                   ({name}) => name.startsWith('DRVHighAndTPV'))
                 ))
                ))
                .map(({commentType, comments}, idx) => [
                  <dt key={`label-${idx}`}>
                    {mutationTypesByGenes[gene.name][commentType]}
                  </dt>,
                  <dd key={`list-${idx}`}>
                    <ul>
                      {(() => {
                        let commentsByText = {};
                        for (const cmt of comments) {
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
                            {highlight(
                              idx, cmts[0].text,
                              cmts.reduce((l, cmt) => (
                                l.concat(cmt.highlightText)
                              ), [])
                            )}
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
}

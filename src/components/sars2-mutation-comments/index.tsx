import React from 'react';
import Markdown from '../markdown';
import shortenMutList from '../../utils/shorten-mutation-list';
import createPersistedReducer from '../../utils/use-persisted-reducer';
import ConfigContext from '../../utils/config-context';
import CheckboxInput from '../checkbox-input';

import style from './style.module.scss';

const useDisplayRefLink = createPersistedReducer<boolean, unknown>(
  '--sierra-report-display-reflink-opt'
);

interface TriggeredMutation {
  gene: {name: string};
  text: string;
}

interface MutationCommentProps {
  triggeredMutations: TriggeredMutation[];
  comment: string;
}

/**
 * Render a single mutation comment item.
 */
function MutationComment({triggeredMutations, comment}: MutationCommentProps) {
  const [config, loading] = ConfigContext.use() as any;
  const geneDisplay = loading ? {} : config.geneDisplay;
    const muts = shortenMutList(triggeredMutations as any).map(({
      gene: {name: geneName},
      text
    }) => (
    geneName === 'S' ? text : `${geneDisplay[geneName] || geneName}:${text}`
  ));
  return <li key={muts.join('+')}>
    <div className={style['triggered-mutations']}>
      {muts.map(mut => <React.Fragment key={mut}>
        <span className={style['mut-sep']}>·</span>
        {mut}
      </React.Fragment>)}
    </div>
    <div className={style['mutation-comment']}>
      <Markdown escapeHtml={false} displayReferences={false}>
        {comment}
      </Markdown>
    </div>
  </li>;
}

interface SARS2MutationCommentsProps {
  mutationComments: MutationCommentProps[];
}

/**
 * Display SARS2 mutation comments with optional reference links toggle.
 */
function SARS2MutationComments({mutationComments}: SARS2MutationCommentsProps) {
  const [
    displayRefLink,
    toggleDisplayRefLink
    ] = useDisplayRefLink((state: boolean, _action: unknown) => !state, true);
  if (mutationComments.length > 0) {
    return <div className={style['mutation-comments-container']}>
      <ul
       className={style['mutation-comments']}
       data-display-reflink={displayRefLink}>
        {mutationComments.map((cmtObj, idx) => (
          <MutationComment {...cmtObj} key={idx} />
        ))}
      </ul>
      <div className={style['mutation-comments-options']}>
        <CheckboxInput
         id="toggle-display-reflink"
         name="toggle-display-reflink"
         value="display"
         onChange={toggleDisplayRefLink}
         checked={!displayRefLink}>
          Hide all reference footnotes
        </CheckboxInput>
      </div>
    </div>;
  }
  else {
    return "No comment are available.";
  }
}

export default React.memo(SARS2MutationComments);

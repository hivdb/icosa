import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('../../../../src/components/markdown', () => ({default: ({children}: any) => <>{children}</>}));
vi.mock('../../../../src/utils/config-context', () => ({default: {use: () => [null]}}));

import DRCommentByTypes from '../../../../src/components/report/dr-comment-by-types';

describe('DRCommentByTypes', () => {
  it('renders gene comments and highlights mutations', () => {
    const commentsByTypes = [
      {
        commentType: 'Major',
        comments: [
          {name: 'A23B', text: 'A23B comment', highlightText: ['A23B']}
        ]
      }
    ];
    render(
      <DRCommentByTypes
        gene={{name: 'PR'}}
        commentsByTypes={commentsByTypes}
        disabledDrugs={[]}
      />
    );
    expect(screen.getByText('PR comments')).toBeInTheDocument();
    expect(screen.getByText('**A23B** comment')).toBeInTheDocument();
  });

  it('returns null when all comments are empty', () => {
    const {container} = render(
      <DRCommentByTypes
        gene={{name: 'PR'}}
        commentsByTypes={[{commentType: 'Major', comments: []}]}
        disabledDrugs={[]}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});

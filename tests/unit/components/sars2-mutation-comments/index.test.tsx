import {render} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';
vi.mock('../../../../src/components/markdown', () => ({default: ({children}: any) => <div>{children}</div>}));
vi.mock('../../../../src/components/checkbox-input', () => ({default: ({children}: any) => <div>{children}</div>}));
vi.mock('../../../../src/utils/config-context', () => ({default: {use: () => [{geneDisplay: {}}, false]}}));

import SARS2MutationComments from '../../../../src/components/sars2-mutation-comments';

describe('SARS2MutationComments', () => {
  it('renders mutation comments', () => {
    const mutationComments = [{
      triggeredMutations: [{gene: {name: 'S'}, text: 'N501Y'}],
      comment: 'test comment'
    }];
    const {getByText} = render(
      <SARS2MutationComments mutationComments={mutationComments} />
    );
    expect(getByText('test comment')).toBeInTheDocument();
  });

  it('renders empty message when no comments', () => {
    const {getByText} = render(
      <SARS2MutationComments mutationComments={[]} />
    );
    expect(getByText('No comment are available.')).toBeInTheDocument();
  });
});

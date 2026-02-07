import {render} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../../../../src/utils/config-context', () => ({default: {use: () => [{defaultGene: 'S', geneSynonyms: {}, geneReferences: {}, messages: {}}, false]}}));
vi.mock('../../../../src/utils/mutation', () => ({sanitizeMutations: (muts: string[]) => [muts, []]}));
vi.mock('uuid', () => ({v5: () => 'uuid'}));
vi.mock('found', () => ({useRouter: () => ({match: {location: {query: {}, state: {patterns: [{uuid: '1', name: 'p1', mutations: ['A']}]}}}})}));

import PatternLoader from '../../../../src/components/pattern-loader';

describe('PatternLoader', () => {
  it('provides patterns to children', () => {
    const childFn = vi.fn(({patterns}: any) => <div>{patterns[0].name}</div>);
    const {getByText} = render(
      <PatternLoader lazyLoad={false} children={childFn as any} />
    );
    expect(childFn).toHaveBeenCalled();
    expect(getByText('p1')).toBeInTheDocument();
  });
});

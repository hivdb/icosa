import {render} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import '@testing-library/jest-dom/vitest';

let mockRouter = {
  match: {
    location: {
      query: {},
      state: {patterns: [{uuid: '1', name: 'p1', mutations: ['A']}]}
    }
  }
};

let mockConfig = [{defaultGene: 'S', geneSynonyms: {}, geneReferences: {}, messages: {}}, false];

vi.mock('../../../../src/utils/config-context', () => ({
  default: {
    use: () => mockConfig
  }
}));

vi.mock('../../../../src/utils/mutation', () => ({
  sanitizeMutations: (muts: string[], opts: any) => [muts, []]
}));

vi.mock('uuid', () => ({
  v5: (str: string) => `uuid-${str}`
}));

vi.mock('found', () => ({
  useRouter: () => mockRouter
}));

import PatternLoader from '../../../../src/components/pattern-loader';

describe('PatternLoader', () => {
  beforeEach(() => {
    mockRouter = {
      match: {
        location: {
          query: {},
          state: {patterns: [{uuid: '1', name: 'p1', mutations: ['A']}]}
        }
      }
    };
    mockConfig = [{defaultGene: 'S', geneSynonyms: {}, geneReferences: {}, messages: {}}, false];
  });

  it('provides patterns to children', () => {
    const childFn = vi.fn(({patterns}: any) => <div>{patterns[0].name}</div>);
    const {getByText} = render(
      <PatternLoader lazyLoad={false} children={childFn as any} />
    );
    expect(childFn).toHaveBeenCalled();
    expect(getByText('p1')).toBeInTheDocument();
  });

  it('passes isPending state to children', () => {
    mockConfig = [{defaultGene: 'S', geneSynonyms: {}, geneReferences: {}, messages: {}}, true];
    const childFn = vi.fn(({isPending}: any) => <div>{isPending ? 'loading' : 'loaded'}</div>);
    const {getByText} = render(
      <PatternLoader lazyLoad={false} children={childFn as any} />
    );
    expect(getByText('loading')).toBeInTheDocument();
  });

  it('passes currentSelected to children when lazyLoad is false', () => {
    const childFn = vi.fn(({currentSelected}: any) => (
      <div>{currentSelected.index}-{currentSelected.name}</div>
    ));
    const {getByText} = render(
      <PatternLoader lazyLoad={false} children={childFn as any} />
    );
    expect(getByText('0-p1')).toBeInTheDocument();
  });

  it('passes childProps through to children', () => {
    const childFn = vi.fn(({customProp}: any) => <div>{customProp}</div>);
    const {getByText} = render(
      <PatternLoader lazyLoad={false} childProps={{customProp: 'test'}} children={childFn as any} />
    );
    expect(getByText('test')).toBeInTheDocument();
  });

  it('handles empty patterns array', () => {
    mockRouter.match.location.state = {patterns: []};
    const childFn = vi.fn(({patterns, currentSelected}: any) => (
      <div>{patterns.length}-{JSON.stringify(currentSelected)}</div>
    ));
    const {getByText} = render(
      <PatternLoader lazyLoad={false} children={childFn as any} />
    );
    expect(getByText('0-{}')).toBeInTheDocument();
  });

  it('handles null/undefined patterns in state', () => {
    (mockRouter.match.location as any).state = undefined;
    const childFn = vi.fn(({patterns}: any) => <div>{patterns.length}</div>);
    const {getByText} = render(
      <PatternLoader lazyLoad={false} children={childFn as any} />
    );
    expect(getByText('0')).toBeInTheDocument();
  });

  it('selects pattern by name from query when lazyLoad is true', () => {
    mockRouter.match.location.state = {
      patterns: [
        {uuid: '1', name: 'p1', mutations: ['A']},
        {uuid: '2', name: 'p2', mutations: ['B']},
        {uuid: '3', name: 'p3', mutations: ['C']}
      ]
    };
    mockRouter.match.location.query = {name: 'p2'};
    
    const childFn = vi.fn(({currentSelected}: any) => (
      <div>{currentSelected.index}-{currentSelected.name}</div>
    ));
    const {getByText} = render(
      <PatternLoader lazyLoad={true} children={childFn as any} />
    );
    expect(getByText('1-p2')).toBeInTheDocument();
  });

  it('defaults to first pattern when query name is not found', () => {
    mockRouter.match.location.state = {
      patterns: [
        {uuid: '1', name: 'p1', mutations: ['A']},
        {uuid: '2', name: 'p2', mutations: ['B']}
      ]
    };
    mockRouter.match.location.query = {name: 'nonexistent'};
    
    const childFn = vi.fn(({currentSelected}: any) => (
      <div>{currentSelected.index}-{currentSelected.name}</div>
    ));
    const {getByText} = render(
      <PatternLoader lazyLoad={true} children={childFn as any} />
    );
    expect(getByText('0-p1')).toBeInTheDocument();
  });

  it('defaults to first pattern when no query name provided with lazyLoad', () => {
    mockRouter.match.location.state = {
      patterns: [
        {uuid: '1', name: 'p1', mutations: ['A']},
        {uuid: '2', name: 'p2', mutations: ['B']}
      ]
    };
    mockRouter.match.location.query = {};
    
    const childFn = vi.fn(({currentSelected}: any) => (
      <div>{currentSelected.index}-{currentSelected.name}</div>
    ));
    const {getByText} = render(
      <PatternLoader lazyLoad={true} children={childFn as any} />
    );
    expect(getByText('0-p1')).toBeInTheDocument();
  });

  it('creates pattern from query mutations when provided', () => {
    mockRouter.match.location.state = {patterns: []};
    mockRouter.match.location.query = {
      mutations: 'S:E484K,S:N501Y',
      name: 'Custom Pattern'
    };
    mockConfig = [{
      defaultGene: 'S',
      geneSynonyms: {},
      geneReferences: {},
      messages: {}
    }, false];
    
    const childFn = vi.fn(({patterns}: any) => (
      <div>{patterns[0].name}-{patterns[0].mutations.join(',')}</div>
    ));
    const {getByText} = render(
      <PatternLoader lazyLoad={true} children={childFn as any} />
    );
    expect(getByText('Custom Pattern-S:E484K,S:N501Y')).toBeInTheDocument();
  });

  it('generates name from mutations when no name provided in query', () => {
    mockRouter.match.location.state = {patterns: []};
    mockRouter.match.location.query = {
      mutations: 'S:E484K,S:N501Y'
    };
    mockConfig = [{
      defaultGene: 'S',
      geneSynonyms: {},
      geneReferences: {},
      messages: {}
    }, false];
    
    const childFn = vi.fn(({patterns}: any) => (
      <div>{patterns[0].name}</div>
    ));
    const {getByText} = render(
      <PatternLoader lazyLoad={true} children={childFn as any} />
    );
    expect(getByText('S:E484K+S:N501Y')).toBeInTheDocument();
  });

  it('filters empty mutations from query string', () => {
    mockRouter.match.location.state = {patterns: []};
    mockRouter.match.location.query = {
      mutations: 'S:E484K,,S:N501Y,+'
    };
    mockConfig = [{
      defaultGene: 'S',
      geneSynonyms: {},
      geneReferences: {},
      messages: {}
    }, false];
    
    const childFn = vi.fn(({patterns}: any) => (
      <div>{patterns[0].mutations.length}</div>
    ));
    const {getByText} = render(
      <PatternLoader lazyLoad={true} children={childFn as any} />
    );
    // Should filter out empty strings
    expect(getByText('2')).toBeInTheDocument();
  });

  it('generates uuid from query mutations string', () => {
    mockRouter.match.location.state = {patterns: []};
    mockRouter.match.location.query = {
      mutations: 'S:E484K'
    };
    mockConfig = [{
      defaultGene: 'S',
      geneSynonyms: {},
      geneReferences: {},
      messages: {}
    }, false];
    
    const childFn = vi.fn(({patterns}: any) => (
      <div>{patterns[0].uuid}</div>
    ));
    const {getByText} = render(
      <PatternLoader lazyLoad={true} children={childFn as any} />
    );
    expect(getByText('uuid-S:E484K')).toBeInTheDocument();
  });

  it('does not create pattern from query when config is pending', () => {
    mockRouter.match.location.state = {patterns: [{uuid: '1', name: 'p1', mutations: ['A']}]};
    mockRouter.match.location.query = {
      mutations: 'S:E484K'
    };
    mockConfig = [{
      defaultGene: 'S',
      geneSynonyms: {},
      geneReferences: {},
      messages: {}
    }, true]; // isPending = true
    
    const childFn = vi.fn(({patterns}: any) => (
      <div>{patterns[0].name}</div>
    ));
    const {getByText} = render(
      <PatternLoader lazyLoad={true} children={childFn as any} />
    );
    // Should use state patterns, not create from query
    expect(getByText('p1')).toBeInTheDocument();
  });

  it('handles multiple patterns with different indices', () => {
    mockRouter.match.location.state = {
      patterns: [
        {uuid: '1', name: 'Alpha', mutations: ['A']},
        {uuid: '2', name: 'Beta', mutations: ['B']},
        {uuid: '3', name: 'Gamma', mutations: ['C']},
        {uuid: '4', name: 'Delta', mutations: ['D']}
      ]
    };
    mockRouter.match.location.query = {name: 'Gamma'};
    
    const childFn = vi.fn(({currentSelected, patterns}: any) => (
      <div>{patterns.length}-{currentSelected.index}-{currentSelected.name}</div>
    ));
    const {getByText} = render(
      <PatternLoader lazyLoad={true} children={childFn as any} />
    );
    expect(getByText('4-2-Gamma')).toBeInTheDocument();
  });
});

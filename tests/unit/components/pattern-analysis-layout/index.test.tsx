import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import gql from 'graphql-tag';

import PatternAnalysisContainer from '../../../../src/components/pattern-analysis-layout';
import { calcInitOffsetLimit } from '../../../../src/components/cumu-query';

vi.mock('../../../../src/components/pattern-analysis-layout/query', () => ({
  default: (props: any) => (
    <div data-testid="query-props">{JSON.stringify({
      initOffset: props.initOffset,
      initLimit: props.initLimit,
    })}</div>
  ),
}));

describe('PatternAnalysisContainer', () => {
  it('calculates initial offset and limit', () => {
    const patterns = [
      { name: 'p1', mutations: [] },
      { name: 'p2', mutations: [] },
    ];
    const currentSelected = { index: 0, name: 'p1' };
    const fragment = gql`fragment Dummy on Root { __typename }`;
    render(
      <PatternAnalysisContainer
        query={fragment}
        patterns={patterns}
        currentSelected={currentSelected}
        client={{}}
        lazyLoad={false}
        renderPartialResults
      >
        {() => null}
      </PatternAnalysisContainer>
    );
    const props = JSON.parse(
      screen.getByTestId('query-props').textContent || '{}'
    );
    const expected = calcInitOffsetLimit({
      size: patterns.length,
      curIndex: currentSelected.index,
      lazyLoad: false,
    });
    expect(props.initOffset).toBe(expected.initOffset);
    expect(props.initLimit).toBe(expected.initLimit);
  });
});


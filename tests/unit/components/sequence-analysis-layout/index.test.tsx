import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import gql from 'graphql-tag';

import SequenceAnalysisContainer from '../../../../src/components/sequence-analysis-layout';
import { calcInitOffsetLimit } from '../../../../src/components/cumu-query';

vi.mock('../../../../src/components/sequence-analysis-layout/query', () => ({
  default: (props: any) => (
    <div data-testid="query-props">{JSON.stringify({
      initOffset: props.initOffset,
      initLimit: props.initLimit,
    })}</div>
  ),
}));

describe('SequenceAnalysisContainer', () => {
  it('calculates initial offset and limit', () => {
    const sequences = [
      { inputSequence: { header: 'h1' } },
      { inputSequence: { header: 'h2' } },
    ];
    const currentSelected = { index: 0, name: 'h1' };
    const fragment = gql`fragment Dummy on Root { __typename }`;
    render(
      <SequenceAnalysisContainer
        query={fragment}
        sequences={sequences}
        currentSelected={currentSelected}
        client={{}}
        lazyLoad={false}
        renderPartialResults
      >
        {() => null}
      </SequenceAnalysisContainer>
    );
    const props = JSON.parse(
      screen.getByTestId('query-props').textContent || '{}'
    );
    const expected = calcInitOffsetLimit({
      size: sequences.length,
      curIndex: currentSelected.index,
      lazyLoad: false,
      quickLoadLimit: 2,
    });
    expect(props.initOffset).toBe(expected.initOffset);
    expect(props.initLimit).toBe(expected.initLimit);
  });
});


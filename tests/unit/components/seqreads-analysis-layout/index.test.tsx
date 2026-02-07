import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import gql from 'graphql-tag';

import SeqReadsAnalysisContainer from '../../../../src/components/seqreads-analysis-layout';
import { calcInitOffsetLimit } from '../../../../src/components/cumu-query';
import { SequenceReads } from '../../../../src/components/seqreads-analysis-layout/types';

vi.mock('../../../../src/components/seqreads-analysis-layout/query', () => ({
  default: (props: any) => (
    <div data-testid="query-props">{JSON.stringify({
      initOffset: props.initOffset,
      initLimit: props.initLimit,
    })}</div>
  ),
}));

describe('SeqReadsAnalysisContainer', () => {
  it('calculates initial offset and limit', () => {
    const seqReads: SequenceReads[] = [
      { name: 'r1', strain: 's1', allReads: [] },
      { name: 'r2', strain: 's2', allReads: [] },
    ];
    const currentSelected = { index: 0, name: 'r1' };
    const fragment = gql`fragment Dummy on Root { __typename }`;
    render(
      <SeqReadsAnalysisContainer
        query={fragment}
        allSequenceReads={seqReads}
        currentSelected={currentSelected}
        client={{}}
        lazyLoad={false}
        renderPartialResults
      >
        {() => null}
      </SeqReadsAnalysisContainer>
    );
    const props = JSON.parse(
      screen.getByTestId('query-props').textContent || '{}'
    );
    const expected = calcInitOffsetLimit({
      size: seqReads.length,
      curIndex: currentSelected.index,
      lazyLoad: false,
      quickLoadLimit: 2,
    });
    expect(props.initOffset).toBe(expected.initOffset);
    expect(props.initLimit).toBe(expected.initLimit);
  });
});


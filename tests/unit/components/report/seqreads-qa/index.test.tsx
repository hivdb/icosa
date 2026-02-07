import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {vi} from 'vitest';
vi.mock('graphql-tag.macro', () => ({default: (s: any) => s}));
vi.mock('../../../../../src/components/report/seqreads-qa/ext-codfish', () => ({default: React.forwardRef(() => <div />)}));

import SeqReadsQA from '../../../../../src/components/report/seqreads-qa';

test('SeqReadsQA renders section title', () => {
  render(
    <SeqReadsQA name="S" allGeneSequenceReads={[]} output="default" />
  );
  expect(screen.getByText('Low abundance mutations')).toBeInTheDocument();
});


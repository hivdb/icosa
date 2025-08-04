import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {vi} from 'vitest';
vi.mock('graphql-tag.macro', () => ({default: (s: any) => s}));
vi.mock('./ext-codfish', () => ({default: React.forwardRef(() => <div />)}));

import SeqReadsQA from './index';

test('SeqReadsQA renders section title', () => {
  render(
    <SeqReadsQA name="S" allGeneSequenceReads={[]} output="default" />
  );
  expect(screen.getByText('Low abundance mutations')).toBeInTheDocument();
});


import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import SeqReadsQA from './index';

test('SeqReadsQA renders section title', () => {
  render(
    <SeqReadsQA name="S" allGeneSequenceReads={[]} output="default" />
  );
  expect(screen.getByText('Low abundance mutations')).toBeInTheDocument();
});


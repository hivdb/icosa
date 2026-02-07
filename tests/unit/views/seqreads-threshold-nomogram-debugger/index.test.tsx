import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import SeqReadsTresholdNomogramDebugger from '../../../../src/views/seqreads-threshold-nomogram-debugger';

test('renders nomogram debugger', () => {
  const {container} = render(<SeqReadsTresholdNomogramDebugger />);
  expect(container).toBeInTheDocument();
});

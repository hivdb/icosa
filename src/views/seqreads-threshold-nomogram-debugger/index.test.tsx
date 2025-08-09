import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import SeqReadsTresholdNomogramDebugger from './index';

test('renders nomogram debugger', () => {
  const {container} = render(<SeqReadsTresholdNomogramDebugger />);
  expect(container).toBeInTheDocument();
});

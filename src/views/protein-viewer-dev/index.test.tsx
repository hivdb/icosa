import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import ProteinViewerDev from './index';

// TODO: component uses many NGL APIs; add integration test once proper shims exist.
test.skip('renders protein viewer dev', () => {
  const {container} = render(<ProteinViewerDev />);
  expect(container).toBeInTheDocument();
});

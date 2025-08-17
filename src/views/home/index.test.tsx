import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './index';

vi.mock('found', () => ({
  Link: ({to, children}: any) => <a href={String(to)}>{children}</a>
}));

test('renders SARS-CoV-2 Analysis Program link', () => {
  const {getByText} = render(<Home />);
  expect(getByText(/SARS-CoV-2 Analysis Program/i)).toBeInTheDocument();
});

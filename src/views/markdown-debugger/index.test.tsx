import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import MarkdownDebugger from './index';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

// TODO: enable when Ramda "exports" issues are resolved under Vitest.
test.skip('renders markdown content', () => {
  const {getByText} = render(<MarkdownDebugger />);
  vi.runAllTimers();
  expect(getByText(/Test1/)).toBeInTheDocument();
});

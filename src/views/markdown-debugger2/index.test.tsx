import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import MarkdownDebugger2 from './index';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

// TODO: enable when Ramda "exports" issues are resolved under Vitest.
test.skip('renders anchor link', () => {
  const {getByText} = render(<MarkdownDebugger2 />);
  vi.runAllTimers();
  expect(getByText('wtf')).toBeInTheDocument();
});

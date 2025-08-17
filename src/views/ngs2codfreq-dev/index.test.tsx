import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import NGS2CodFreqDev from './index';

vi.mock('found', () => ({
  useRouter: () => ({
    router: {push: vi.fn()},
    match: {location: {query: {}}}
  })
}));

// TODO: enable when Ramda "exports" issues are resolved under Vitest.
test.skip('renders NGS2CodFreqDev', () => {
  vi.useFakeTimers();
  const {container} = render(<NGS2CodFreqDev />);
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  expect(container).toBeInTheDocument();
});

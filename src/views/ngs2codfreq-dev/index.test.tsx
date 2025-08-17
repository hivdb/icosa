import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import NGS2CodFreqDev from './index';

vi.mock('found', () => ({
  // Minimal hook used by components under test
  useRouter: () => ({
    router: {push: vi.fn()},
    match: {location: {query: {}}}
  }),
  // HOC used by Collapsable Section and others; identity passthrough for tests
  withRouter: (Comp: any) => Comp,
  // Simple Link component stand-in
  Link: ({to, children, ...rest}: any) => <a data-to={to as any} {...rest}>{children}</a>
}));

vi.mock('../../utils/config-context', () => ({
  // Provide a lightweight AsyncContext replacement suitable for tests
  default: {
    Provider: ({children}: any) => <>{children}</>,
    use: () => [{messages: {}, refSequencePath: '', refSequenceName: 'Ref'}, false]
  },
  // Avoid network; resolve provided config immediately
  useConfigLoader: (cfg: any) => async () => cfg
}));

test('renders NGS2CodFreqDev', () => {
  vi.useFakeTimers();
  const {container} = render(<NGS2CodFreqDev />);
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  expect(container).toBeInTheDocument();
});

import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import macroPlugin, {BadMacroNode} from '../../../../src/components/markdown/macro-plugin';

describe('macro-plugin', () => {
  it('exposes addMacro function', () => {
    expect(typeof macroPlugin.addMacro).toBe('function');
  });

  it('renders BadMacroNode error message', () => {
    const {getByText} = render(<BadMacroNode data={{hChildren: [{value: 'unknown'}]}} />);
    expect(getByText(/error/i)).toBeInTheDocument();
    expect(getByText(/unknown/)).toBeInTheDocument();
  });
});

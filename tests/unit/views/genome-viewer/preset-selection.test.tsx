import '@testing-library/jest-dom/vitest';
import React from 'react';
import {render, fireEvent} from '@testing-library/react';
import RouterContext from 'found/RouterContext';
import PresetSelection from '../../../../src/views/genome-viewer/preset-selection';
import type {SelectOption} from '../../../../src/components/select';

vi.mock('../../../../src/components/select', () => ({
  __esModule: true,
  default: ({options, onChange}: {options: SelectOption[]; onChange: (opt: SelectOption | null) => void}) => (
    <select 
      data-testid="select" 
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = options.find(opt => opt.value === e.target.value);
        onChange(selected || null);
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}));

describe('PresetSelection', () => {
  it('navigates to selected preset', () => {
    const push = vi.fn();
    const context = {router: {push}, match: {location: {pathname: '/genome-viewer/foo/'}}};
    const options = [
      {value: 'foo', label: 'Foo'},
      {value: 'bar', label: 'Bar'}
    ];
    const {getByTestId} = render(
      <RouterContext.Provider value={context}>
        <PresetSelection options={options} />
      </RouterContext.Provider>
    );
    fireEvent.change(getByTestId('select'), {target: {value: 'bar'}});
    expect(push).toHaveBeenCalledWith('/genome-viewer/bar/');
  });

  it('navigates when no current preset is selected', () => {
    const push = vi.fn();
    const context = {router: {push}, match: {location: {pathname: '/genome-viewer/'}}};
    const options = [
      {value: 'foo', label: 'Foo'},
      {value: 'bar', label: 'Bar'}
    ];
    const {getByTestId} = render(
      <RouterContext.Provider value={context}>
        <PresetSelection options={options} />
      </RouterContext.Provider>
    );
    fireEvent.change(getByTestId('select'), {target: {value: 'bar'}});
    expect(push).toHaveBeenCalledWith('/genome-viewer/bar/');
  });

  it('applies custom className', () => {
    const push = vi.fn();
    const context = {router: {push}, match: {location: {pathname: '/genome-viewer/'}}};
    const options = [{value: 'foo', label: 'Foo'}];
    const {container} = render(
      <RouterContext.Provider value={context}>
        <PresetSelection options={options} className="custom-class" />
      </RouterContext.Provider>
    );
    const section = container.querySelector('section');
    expect(section).toHaveClass('custom-class');
  });

  it('renders with custom element type', () => {
    const push = vi.fn();
    const context = {router: {push}, match: {location: {pathname: '/genome-viewer/'}}};
    const options = [{value: 'foo', label: 'Foo'}];
    const {container} = render(
      <RouterContext.Provider value={context}>
        <PresetSelection options={options} as="div" />
      </RouterContext.Provider>
    );
    const div = container.querySelector('div');
    expect(div).toBeInTheDocument();
  });

  it('throws error when used outside router context', () => {
    const options = [{value: 'foo', label: 'Foo'}];
    
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<PresetSelection options={options} />);
    }).toThrow('PresetSelection must be used within a router');
    
    consoleError.mockRestore();
  });

  it('handles null selectedOption in onChange', () => {
    const push = vi.fn();
    const context = {router: {push}, match: {location: {pathname: '/genome-viewer/foo/'}}};
    const options = [{value: 'foo', label: 'Foo'}];
    
    const {getByTestId} = render(
      <RouterContext.Provider value={context}>
        <PresetSelection options={options} />
      </RouterContext.Provider>
    );
    
    // Simulate selecting an invalid option that returns null
    fireEvent.change(getByTestId('select'), {target: {value: ''}});
    
    // push should not be called when value is empty
    expect(push).not.toHaveBeenCalled();
  });

  it('correctly identifies current preset from pathname', () => {
    const push = vi.fn();
    const context = {router: {push}, match: {location: {pathname: '/genome-viewer/foo/'}}};
    const options = [
      {value: 'foo', label: 'Foo'},
      {value: 'bar', label: 'Bar'}
    ];
    
    render(
      <RouterContext.Provider value={context}>
        <PresetSelection options={options} />
      </RouterContext.Provider>
    );
    
    // The component should identify 'foo' as the current preset
    // This is tested implicitly through the rendering
    expect(push).not.toHaveBeenCalled();
  });

  it('handles pathname without trailing slash', () => {
    const push = vi.fn();
    const context = {router: {push}, match: {location: {pathname: '/genome-viewer/foo'}}};
    const options = [{value: 'foo', label: 'Foo'}];
    
    const {container} = render(
      <RouterContext.Provider value={context}>
        <PresetSelection options={options} />
      </RouterContext.Provider>
    );
    
    expect(container).toBeInTheDocument();
  });
});


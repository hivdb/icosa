import '@testing-library/jest-dom';
import React from 'react';
import {render, fireEvent} from '@testing-library/react';
import RouterContext from 'found/RouterContext';
import PresetSelection from './preset-selection';

vi.mock('react-dropdown', () => ({
  __esModule: true,
  default: ({options, onChange}: any) => (
    <select data-testid="dropdown" onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange({value: e.target.value})}>
      {options.map((opt: any) => (
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
    fireEvent.change(getByTestId('dropdown'), {target: {value: 'bar'}});
    expect(push).toHaveBeenCalledWith('/genome-viewer/bar/');
  });
});


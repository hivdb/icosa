import '@testing-library/jest-dom';
import React from 'react';
import {render, fireEvent} from '@testing-library/react';
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
    const router = {push};
    const match = {location: {pathname: '/mut-annot-viewer/'}};
    const options = [
      {value: 'foo', label: 'Foo'},
      {value: 'bar', label: 'Bar'}
    ];
    const {getByTestId} = render(
      <PresetSelection match={match} router={router} options={options} />
    );
    fireEvent.change(getByTestId('dropdown'), {target: {value: 'bar'}});
    expect(push).toHaveBeenCalledWith('/mut-annot-viewer/bar/');
  });
});

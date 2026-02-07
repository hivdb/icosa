import {render} from '@testing-library/react';
import AutofitGraph from '../../../../src/components/report/autofit';
import {vi} from 'vitest';

describe('AutofitGraph', () => {
  test('calls onResize when window resizes', () => {
    const onResize = vi.fn();
    const {container} = render(
      <AutofitGraph onResize={onResize} output="default">
        <div>content</div>
      </AutofitGraph>
    );
    const section = container.querySelector('section') as HTMLElement;
    Object.defineProperty(section, 'clientWidth', {value: 200, configurable: true});
    window.dispatchEvent(new Event('resize'));
    expect(onResize).toHaveBeenCalledWith({width: 200});
  });

  test('does not listen when output is printable', () => {
    const onResize = vi.fn();
    render(
      <AutofitGraph onResize={onResize} output="printable">
        <div>content</div>
      </AutofitGraph>
    );
    window.dispatchEvent(new Event('resize'));
    expect(onResize).not.toHaveBeenCalled();
  });
});

import {render} from '@testing-library/react';
import {describe, it, expect, vi, beforeAll} from 'vitest';
import '@testing-library/jest-dom';

import Paginator from './index';

beforeAll(() => {
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    getPropertyValue: () => '10'
  } as any);
});

describe('Paginator', () => {
  it('renders items and footnote', () => {
    const handleClick = vi.fn();
    const {getByText} = render(
      <Paginator currentSelected="A" footnote="foot">
        <Paginator.Item name="A" onClick={handleClick}>A</Paginator.Item>
        <Paginator.Item name="B">B</Paginator.Item>
      </Paginator>
    );
    expect(getByText('A')).toBeInTheDocument();
    expect(getByText('B')).toBeInTheDocument();
    expect(getByText('foot')).toBeInTheDocument();
  });
});

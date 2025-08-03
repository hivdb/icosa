import {render, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

import Button from './button';

describe('ReportPaginator Button', () => {
  it('triggers onClick when clicked', () => {
    const handleClick = vi.fn();
    const {getByText} = render(
      <Button onClick={handleClick}>Next</Button>
    );
    fireEvent.click(getByText('Next'));
    expect(handleClick).toHaveBeenCalled();
  });
});

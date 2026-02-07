import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

import BackToTop from '../../../../src/components/back-to-top';


describe('BackToTop', () => {
  it('calls window.scrollTo when clicked', () => {
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<BackToTop />);
    fireEvent.click(screen.getByRole('link'));
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
    scrollSpy.mockRestore();
  });
});


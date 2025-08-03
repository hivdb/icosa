import React from 'react';
import {render, fireEvent} from '@testing-library/react';
import Button from '../button';
import Loader from '../loader';
import InlineLoader from '../inline-loader';
import BackToTop from '../back-to-top';
import Placeholder from '../placeholder';

describe('converted components', () => {
  test('Button renders with text', () => {
    const {getByText} = render(<Button>Click</Button>);
    expect(getByText('Click')).toBeInTheDocument();
  });

  test('Loader adds inline class', () => {
    const {container} = render(<Loader inline />);
    expect(container.firstChild).toHaveClass('lds-ring-inline');
  });

  test('InlineLoader forces inline mode', () => {
    const {container} = render(<InlineLoader />);
    expect(container.firstChild).toHaveClass('lds-ring-inline');
  });

  test('BackToTop triggers scroll', () => {
    const scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const {getByRole} = render(<BackToTop />);
    fireEvent.click(getByRole('link'));
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
    scrollSpy.mockRestore();
  });

  test('Placeholder renders placeholder item', () => {
    const {container} = render(<Placeholder />);
    expect(container.firstChild).toHaveClass('ph-item');
  });
});


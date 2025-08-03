import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import CustomColors from './custom-colors';

describe('CustomColors', () => {
  it('applies css variables and renders element type', () => {
    const {getByText} = render(
      <CustomColors as="section" colors={{primary: '#fff'}}>
        Content
      </CustomColors>
    );
    const elem = getByText('Content');
    expect(elem.tagName).toBe('SECTION');
    expect(elem).toHaveStyle({'--sierra-color-primary': '#fff'});
  });
});

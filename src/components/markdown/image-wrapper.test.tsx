import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import ImageWrapper from './image-wrapper';

describe('ImageWrapper', () => {
  it('renders youtube iframe when url is youtube', () => {
    const Wrapped = ImageWrapper({imagePrefix: '/img/'});
    const {container} = render(<Wrapped src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" alt="yt" />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toHaveAttribute('src', expect.stringContaining('youtube.com/embed'));
  });

  it('renders img with prefixed src', () => {
    const Wrapped = ImageWrapper({imagePrefix: '/img/'});
    const {getByAltText} = render(<Wrapped src="logo.png" alt="logo" />);
    const img = getByAltText('logo') as HTMLImageElement;
    expect(img).toHaveAttribute('src', '/img/logo.png');
  });
});

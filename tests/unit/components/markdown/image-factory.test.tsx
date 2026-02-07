import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import ImageFactory from '../../../../src/components/markdown/image-factory';

describe('ImageFactory', () => {
  it('renders youtube iframe when url is youtube', () => {
    const Wrapped = ImageFactory({imagePrefix: '/img/'});
    const {container} = render(<Wrapped src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" alt="yt" />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toHaveAttribute('src', expect.stringContaining('youtube.com/embed'));
  });

  it('renders img with prefixed src', () => {
    const Wrapped = ImageFactory({imagePrefix: '/img/'});
    const {getByAltText} = render(<Wrapped src="logo.png" alt="logo" />);
    const img = getByAltText('logo') as HTMLImageElement;
    expect(img).toHaveAttribute('src', '/img/logo.png');
  });

  it('parses style parameters from hashbang', () => {
    const Wrapped = ImageFactory({});
    const {getByAltText} = render(
      <Wrapped src="photo.jpg#!width=100px&height=50px" alt="photo" />
    );
    const img = getByAltText('photo') as HTMLImageElement;
    expect(img.style.width).toBe('100px');
    expect(img.style.height).toBe('50px');
  });

  it('keeps absolute image URLs intact', () => {
    const Wrapped = ImageFactory({imagePrefix: '/img/'});
    const {getByAltText} = render(
      <Wrapped src="https://example.com/x.png" alt="abs" />
    );
    const img = getByAltText('abs');
    expect(img).toHaveAttribute('src', 'https://example.com/x.png');
  });
});

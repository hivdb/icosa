import {render, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

import DownloadSVG from './index';

vi.mock('svg-crowbar/dist/esm/inputProcessor', () => ({
  default: vi.fn(() => ({source: '<svg></svg>'})),
  __esModule: true
}));

vi.mock('../../utils/download', () => ({
  makeDownload: vi.fn()
}));

import {makeDownload} from '../../utils/download';

describe('DownloadSVG', () => {
  it('downloads svg when clicked', async () => {
    const svg = document.createElement('svg');
    document.body.appendChild(svg);
    const {getByRole} = render(
      <DownloadSVG target={svg} fileName="test.svg">Download</DownloadSVG>
    );
    await fireEvent.click(getByRole('button'));
    expect(makeDownload).toHaveBeenCalledWith('test.svg', 'image/svg+xml', '<svg></svg>');
    document.body.removeChild(svg);
  });
});

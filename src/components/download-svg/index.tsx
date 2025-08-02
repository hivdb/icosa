import React from 'react';
import getSource from 'svg-crowbar/dist/esm/inputProcessor';
import Button from '../button';
import {makeDownload} from '../../utils/download';
import style from './style.module.scss';

export interface DownloadSVGProps {
  name?: string;
  target?: Element | {current?: Element | null};
  fileName?: string;
  css?: 'internal' | 'inline' | 'none';
  children?: React.ReactNode;
  [key: string]: any;
}

export default function DownloadSVG({
  name = 'download-svg',
  target,
  fileName,
  css = 'inline',
  children = 'Download SVG',
  ...props
}: DownloadSVGProps) {
  const handleClick = React.useCallback(
    async (e?: React.MouseEvent) => {
      e && e.preventDefault();
      let tgt: any = target;
      if (tgt?.current) {
        tgt = tgt.current;
      }
      if (tgt instanceof Element) {
        const cloned = tgt.cloneNode(true);
        const container = document.createElement('div');
        container.className = style['svg-download-container'];
        container.appendChild(cloned);
        for (const elem of container.querySelectorAll('*[id]')) {
          (elem as Element).id = `sd-${(elem as Element).id}`;
        }
        document.body.appendChild(container);
        const {source} = getSource(cloned as any, {css});
        makeDownload(fileName, 'image/svg+xml', source);
        setTimeout(() => document.body.removeChild(container));
      }
    },
    [target, fileName, css]
  );

  return (
    <Button {...props} name={name} onClick={handleClick}>
      {children}
    </Button>
  );
}

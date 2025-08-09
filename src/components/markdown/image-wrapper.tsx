import React from 'react';
import * as queryString from 'query-string';
import * as youtubeUrl from 'youtube-url';

interface CommonProps extends React.HTMLAttributes<HTMLImageElement> {
  src: string | number;
  style?: React.CSSProperties;
  alt?: string;
  imagePrefix?: string;
}

function Youtube({src, style, alt, ...props}: CommonProps) {
  const youtubeId = youtubeUrl.extractId(String(src));
  const iframeProps = props as React.IframeHTMLAttributes<HTMLIFrameElement>;
  return (
    <iframe
     {...iframeProps}
     style={style}
     title={alt}
     src={`https://www.youtube.com/embed/${youtubeId}`}
     frameBorder="0"
     allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
     allowFullScreen />
  );
}

function Image({src, style, alt, imagePrefix, ...props}: CommonProps) {
  const url = src && /https?:\/\//i.test(String(src)) ? src : `${imagePrefix ?? ''}${src}`;
  return <img {...props} alt={alt} src={String(url)} style={style} />;
}

export default function ImageWrapper({imagePrefix}: {imagePrefix?: string}) {
  return function Dispatcher({src, alt, ...props}: CommonProps) {
    let style: React.CSSProperties | undefined;
    let source = String(src);
    const parts = source.split(/#!(?=[^#]+$)/);
    source = parts[0];
    if (parts[1]) {
      style = queryString.parse(parts[1]) as unknown as React.CSSProperties;
      style = {...style};
    }

    if (youtubeUrl.valid(source)) {
      return <Youtube {...props} {...{src: source, style, alt}} />;
    }
    return <Image {...props} {...{src: source, style, alt, imagePrefix}} />;
  };
}

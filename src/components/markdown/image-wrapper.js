import React from 'react';
import * as queryString from 'query-string';
import * as youtubeUrl from 'youtube-url';


function Youtube({src, style, alt, ...props}) {
  const youtubeId = youtubeUrl.extractId(src);
  return (
    <iframe
     {...props}
     style={style}
     title={alt}
     src={`https://www.youtube.com/embed/${youtubeId}`}
     frameBorder="0"
     allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
     allowFullScreen />
  );
}


function Image({src, style, alt, imagePrefix, ...props}) {
  src = src && /https?:\/\//i.test(src) ? src : `${imagePrefix}${src}`;
  return <img {...props} alt={alt} src={src} style={style} />;
}


export default function ImageWrapper({imagePrefix}) {

  return Dispatcher;

  function Dispatcher({src, alt, ...props}) {
    let style;
    [src, style] = src.split(/#!(?=[^#]+$)/);
    if (style) {
      style = queryString.parse(style);
      style = {...style};  // the object from queryString is null-prototype
    }

    if (youtubeUrl.valid(src)) {
      return <Youtube {...props} {...{src, style, alt}} />;
    }
    return <Image {...props} {...{src, style, alt, imagePrefix}} />;
  }
}

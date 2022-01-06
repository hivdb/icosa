import React from 'react';
import PropTypes from 'prop-types';
import * as queryString from 'query-string';
import * as youtubeUrl from 'youtube-url';

const commonPropTypes = {
  src: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.number.isRequired
  ]),
  style: PropTypes.object,
  alt: PropTypes.string,
  imagePrefix: PropTypes.string
};


Youtube.propTypes = commonPropTypes;

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


Image.propTypes = commonPropTypes;

function Image({src, style, alt, imagePrefix, ...props}) {
  src = src && /https?:\/\//i.test(src) ? src : `${imagePrefix}${src}`;
  return <img {...props} alt={alt} src={src} style={style} />;
}


ImageWrapper.propTypes = {
  imagePrefix: PropTypes.string
};

export default function ImageWrapper({imagePrefix}) {
  /* eslint-disable react/prop-types */

  return Dispatcher;

  function Dispatcher({src, alt, ...props}) {
    let style;
    [src, style] = src.split(/#!(?=[^#]+$)/);
    if (style) {
      style = queryString.parse(style);
      style = {...style}; // the object from queryString is null-prototype
    }

    if (youtubeUrl.valid(src)) {
      return <Youtube {...props} {...{src, style, alt}} />;
    }
    return <Image {...props} {...{src, style, alt, imagePrefix}} />;
  }
}

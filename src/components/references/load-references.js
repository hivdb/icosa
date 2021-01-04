import React from 'react';

export default function LoadReferences({
  references,
  children,
  onLoad = () => null
}) {
  onLoad();
  return <>{references.map(children)}</>;
}

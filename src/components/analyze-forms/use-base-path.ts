import React from 'react';

/**
 * Pure helper that strips the last path segment representing the tab name.
 *
 * @param pathname - Full pathname including the tab segment.
 * @returns The pathname without the final segment.
 */
export function getBasePath(pathname: string): string {
  const tabName = pathname.replace(/\/$/, '').split(/\//);
  return tabName.slice(0, tabName.length - 1).join('/');
}

/**
 * React hook wrapper around {@link getBasePath}.
 *
 * @param location - Router location object.
 * @returns Memoized base path string.
 */
export default function useBasePath(location: {pathname: string}): string {
  return React.useMemo(() => getBasePath(location.pathname), [location.pathname]);
}

import React from 'react';

/**
 * Compute base path excluding the current tab segment.
 *
 * @param location - Router location object.
 * @returns Pathname prefix before the tab segment.
 */
export function useBasePath(location: {pathname: string}): string {
  return React.useMemo(() => {
    const segments = location.pathname.replace(/\/$/, '').split(/\//);
    return segments.slice(0, segments.length - 1).join('/');
  }, [location.pathname]);
}

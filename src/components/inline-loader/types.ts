/**
 * Type definitions for InlineLoader component.
 *
 * InlineLoader is a wrapper around Loader that always renders inline.
 */

import type {LoaderProps} from '../loader/types';

/**
 * Props for InlineLoader component.
 * Extends LoaderProps from the base Loader component, excluding 'inline' since it's always true.
 */
export type InlineLoaderProps = Omit<LoaderProps, 'inline'>;

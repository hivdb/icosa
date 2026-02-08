/**
 * Type definitions for the cumulative query system.
 * 
 * This module provides a hook for fetching data cumulatively with cursor-based
 * pagination, caching, and lazy loading support.
 */

import type {ApolloClient, DocumentNode, ApolloError} from '@apollo/client';

/**
 * Cursor state for tracking current position in paginated data.
 */
export interface Cursor {
  /** Index of the first item to load in this batch. */
  loadFirstIndex?: number;
  /** Starting offset in the input array. */
  offset: number;
  /** Number of items to load. */
  limit: number;
}

/**
 * Progress information for the current query operation.
 */
export interface ProgressObj {
  /** Number of items already fetched and cached. */
  progress: number;
  /** Number of items that will be fetched after current operation. */
  nextProgress: number;
  /** Total number of items to fetch. */
  total: number;
}

/**
 * Function to fetch another item by its unique key.
 * 
 * @param curName - Unique identifier of the item to fetch
 * @param updateCurrentSelected - Whether to update URL state (default: true)
 * @returns Promise that resolves when the item is loaded
 */
export type FetchAnotherFn = (
  curName: any,
  updateCurrentSelected?: boolean
) => Promise<unknown> | undefined;

/**
 * Result returned by useCumuQuery hook.
 */
export interface UseCumuQueryResult<TData = any> {
  /** Whether all requested data has been loaded. */
  loaded: boolean;
  /** GraphQL error if query failed, null otherwise. */
  error: ApolloError | null;
  /** Query variables excluding the main input array. */
  extVariables: Record<string, any>;
  /** Merged data from all fetched batches. */
  data: TData;
  /** Current cursor state (only present when no error). */
  cursor?: Cursor;
  /** Progress information for the current operation. */
  progressObj: ProgressObj;
  /** Function to fetch another item. */
  fetchAnother: FetchAnotherFn;
}

/**
 * Arguments for useCumuQuery hook.
 */
export interface UseCumuQueryArgs {
  /** GraphQL query document. */
  query: DocumentNode;
  /** Apollo client instance. */
  client: ApolloClient<any>;
  /** Name of the main input variable in the query. */
  mainInputName: string;
  /** Array of input objects to query. */
  inputObjs: any[];
  /** Name of the main output field in the response. */
  mainOutputName: string;
  /** Path to the unique key within each output object. */
  outputUniqKeyName: string;
  /** Initial cursor offset. */
  initOffset: number;
  /** Initial cursor limit. */
  initLimit: number;
  /** Function to extend query variables with additional fields. */
  onExtendVariables: (vars: Record<string, any>) => Record<string, any>;
  /** Currently selected item. */
  currentSelected: {index: number};
  /** Path to unique key within each input object. */
  inputUniqKeyName: string;
  /** Maximum items fetched per GraphQL request. */
  maxPerRequest: number;
  /** Whether to enable lazy loading (fetch on demand). */
  lazyLoad: boolean;
  /** Number of items to load quickly when lazy loading (default: 2). */
  quickLoadLimit?: number;
}

/**
 * Cache for storing fetched results.
 */
export interface ResultCache {
  /** Original input objects array. */
  inputObjs: any[];
  /** Lookup table mapping unique keys to output objects. */
  lookup: Record<string, any>;
  /** Miscellaneous data from query responses. */
  misc: Record<string, any>;
}

/**
 * Arguments for useResultCache hook.
 */
export interface ResultCacheArgs {
  /** Array of input objects. */
  inputObjs: any[];
  /** Name of the main output field. */
  mainOutputName: string;
  /** Path to unique key in output objects. */
  outputUniqKeyName: string;
}

/**
 * Result from useResultCache hook.
 */
export interface UseResultCacheResult {
  /** Function to cache query results. */
  cacheResults: (data: Record<string, any>) => ResultCache;
  /** Function to restore all cached results. */
  restoreResults: () => Record<string, any>;
  /** Function to check if an item is cached. */
  isCached: (uniqKeyVal: string) => boolean;
}

/**
 * Arguments for useCursorAndVariables hook.
 */
export interface UseCursorAndVariablesArgs {
  /** Initial offset. */
  initOffset: number;
  /** Initial limit. */
  initLimit: number;
  /** Function to check if item is cached. */
  isCached: (key: any) => boolean;
  /** Array of input objects. */
  inputObjs: any[];
  /** Currently selected item. */
  currentSelected: {index: number};
  /** Path to unique key in input objects. */
  inputUniqKeyName: string;
  /** Name of main input variable. */
  mainInputName: string;
  /** Max items per request. */
  maxPerRequest: number;
  /** Function to extend variables. */
  onExtendVariables: (vars: Record<string, any>) => Record<string, any>;
}

/**
 * Variables derived from cursor state.
 */
export interface CursorVariables {
  /** Query variables. */
  variables: Record<string, any>;
  /** Whether the query would be empty. */
  isEmptyQuery: boolean;
  /** Number of items already fetched. */
  fetchedCount: number;
  /** Number of items currently being fetched. */
  fetchingCount: number;
}

/**
 * Result from useCursorAndVariables hook.
 */
export interface UseCursorAndVariablesResult extends CursorVariables {
  /** Function to check if cursor is fulfilled. */
  isCursorFulfilled: () => boolean;
  /** Function to get variables for a cursor. */
  getVariables: (cursor: Cursor) => CursorVariables;
  /** Current cursor state. */
  cursor: Cursor;
  /** Function to update cursor. */
  setCursor: (cursor: Cursor) => void;
}

/**
 * Arguments for useFetchAnother hook.
 */
export interface UseFetchAnotherArgs {
  /** Array of input objects. */
  inputObjs: any[];
  /** Whether data is loaded. */
  loaded: boolean;
  /** Function to check if cached. */
  isCached: (name: any) => boolean;
  /** Function to update cursor. */
  setCursor: (cursor: Cursor) => void;
  /** Whether lazy loading is enabled. */
  lazyLoad: boolean;
  /** Quick load limit. */
  quickLoadLimit?: number;
  /** Path to unique key in input objects. */
  inputUniqKeyName: string;
}

/**
 * Options for calculating offset and limit.
 */
export interface OffsetLimitOptions {
  /** Total size of the dataset. */
  size: number;
  /** Current offset position. */
  offset: number;
  /** Whether lazy loading is enabled. */
  lazyLoad: boolean;
  /** Quick load limit for lazy loading. */
  quickLoadLimit?: number;
}

/**
 * Result from offset/limit calculation.
 */
export interface OffsetLimitResult {
  /** Index of first item to load. */
  loadFirstIndex: number;
  /** Starting offset. */
  offset: number;
  /** Number of items to load. */
  limit: number;
}

/**
 * Options for calculating initial offset and limit.
 */
export interface InitOffsetLimitOptions {
  /** Total size of dataset. */
  size: number;
  /** Current selected index. */
  curIndex?: number | null;
  /** Whether lazy loading is enabled. */
  lazyLoad: boolean;
  /** Quick load limit. */
  quickLoadLimit?: number;
}

/**
 * Result from initial offset/limit calculation.
 */
export interface InitOffsetLimitResult {
  /** Initial offset. */
  initOffset: number;
  /** Initial limit. */
  initLimit: number;
}

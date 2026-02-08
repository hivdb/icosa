import React from 'react';
import Loader from '../loader';
import type {FixedLoaderProps} from './types';

export type {FixedLoaderProps} from './types';

export default function FixedLoader(props: FixedLoaderProps) {
  return <Loader {...props} modal />;
}


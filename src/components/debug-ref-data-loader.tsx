export interface Reference {
  name: string;
  [key: string]: any;
}

export interface DebugRefDataLoaderProps {
  references: Reference[];
  setReference: (name: string, ref: any, flag: boolean) => void;
  onLoad?: () => void;
}

/**
 * Loader used in development mode to quickly populate reference data.
 */
export default function DebugRefDataLoader({
  references,
  setReference,
  onLoad = () => null
}: DebugRefDataLoaderProps) {
  // eslint-disable-next-line no-console
  console.log('Current window of DebugRefDataLoader: ', window.name);
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('Mounting DebugRefDataLoader...');
    setTimeout(() => {
      references.map(ref => setReference(ref.name, {...ref}, false));
    });
  }
  onLoad();
  return null;
}

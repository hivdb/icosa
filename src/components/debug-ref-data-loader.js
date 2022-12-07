export default function DebugRefDataLoader({
  references,
  setReference,
  onLoad = () => null
}) {
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

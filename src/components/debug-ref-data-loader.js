export default function DebugRefDataLoader({
  references,
  setReference,
  onLoad = () => null
}) {
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

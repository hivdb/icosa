import React from 'react';
import Markdown from '../../components/markdown';
import ConfigContext from '../../utils/config-context';

export default function HBVRefDataLoader({
  references,
  setReference,
  onLoad = () => null
}) {
  const [config, loading] = ConfigContext.use();
  React.useEffect(
    () => {
      if (loading) return;
      const {citations} = config;
      for (const refProps of references) {
        const {name} = refProps;
        const children = (
          <Markdown inline escapeHtml={false} displayReferences={false}>
            {citations?.[name] ?? name}
          </Markdown>
        );
        setReference(name, {children}, /* incr=*/false);
      }
      onLoad();
    },
    [config, loading, references, setReference, onLoad]
  );
  return null;
}

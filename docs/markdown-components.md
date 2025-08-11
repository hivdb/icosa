# Markdown Component Usage and Extensions

The `src/components/markdown` module renders Markdown content for HIVDB
projects. Both `hivdb-cms` and `chiro-cms` load their page text through this
component, so the features described here apply to Markdown in those
repositories as well.

## Renderer customisations

The component wraps `react-markdown/with-html` and applies several changes to
the upstream renderer:

* **Raw HTML allowed** – HTML is not escaped and the optional `escapeHtml`
  flag in page settings can further disable sanitisation.
* **Footnotes and references** – `parserOptions` enable footnotes and the
  component injects a references list at the end of each document.
* **Custom link and image renderers** – links and images bypass the default URI
  transformation and images may be prefixed with a CMS path.
* **Heading anchors** – headings are wrapped with anchors and optional
  collapsible sections for selected heading levels.
* **Macros** – a `remark-macro` plugin adds support for directives such as
  `table`, `genome-map` and `toc`.
* **Table of contents** – when enabled, `AutoTOC` builds a heading outline at
  render time.

## Basic usage

```tsx
import Markdown from '@/components/markdown';

export function Page({source}: {source: string}) {
  return <Markdown>{source}</Markdown>;
}
```

## Advanced usage

```tsx
<Markdown
  toc
  collapsableLevels={[3]}
  imagePrefix="/cms"
  tables={tablePresets}
  genomeMaps={mapPresets}
>
  {`{{table example}}

{{genome-map mapA}}`}
</Markdown>
```

* `toc` generates an automatic table of contents via the `AutoTOC` component.
* `collapsableLevels` wraps the specified heading levels in collapsible
  sections.
* `tables` and `genomeMaps` supply presets referenced by the `{{table name}}`
  and `{{genome-map name}}` macros.

## Differences from CommonMark and GitHub Flavored Markdown

* Macros (`{{table}}`, `{{genome-map}}`, `{{toc}}`) and automatic references are
  not part of the CommonMark specification or GitHub Flavored Markdown.
* Links are not sanitised (`transformLinkUri` is disabled), allowing nonstandard
  protocols that GitHub would filter.
* Raw HTML passes through unescaped, while GitHub strips many tags for safety.

These deviations should be kept in mind when adding new Markdown features or
when porting content from other Markdown processors.


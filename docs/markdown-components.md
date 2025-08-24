# Markdown Component Usage and Extensions

The `src/components/markdown` module renders Markdown content for HIVDB
projects. Both `hivdb-cms` and `chiro-cms` load their page text through this
component, so the features described here apply to Markdown in those
repositories as well.

## Renderer customisations

The component wraps `react-markdown` with its built-in HTML parser plugin and
applies several changes to the upstream renderer:

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
  {`[table]
example
[/table]

[genomemap]
mapA
[/genomemap]`}
</Markdown>
```

* `toc` generates an automatic table of contents via the `AutoTOC` component.
* `collapsableLevels` wraps the specified heading levels in collapsible
  sections.
* `tables` and `genomeMaps` supply presets referenced by the `[table]...[/table]`
  and `[genomemap]...[/genomemap]` macros.

## Macros

The Markdown renderer supports a small set of block macros. Macros must be
placed on their own lines and use square‑bracket tags with an opening and
closing form. Optional properties can be provided on the opening tag.

- General form: `[name optional, props]` on a line, followed by the macro body
  (if any), then a closing tag `[/name]` on its own line.

Supported macros:

### [table]…[/table]

Renders a table from a named preset provided via the `tables` prop.

- Syntax:
  ```
  [table compact, lastCompact]
  presetName
  [/table]
  ```
- Body: the first non‑empty line inside the block is treated as the table name.
- Props (all optional):
  - `compact`: when present, renders the table in compact mode.
  - `lastCompact`: when present, renders the last row compacted.
  - `noHeaderOverlapping`: prevents header overlap.
  - `windowScroll`: uses window scroll instead of container scroll.

The table preset must exist in the `tables` object passed to `<Markdown />` and
contain `columnDefs` and `data`. Column renderers support helpers like `nl2br`,
`template`, `join`, `nowrap`, and more based on the application’s SimpleTable.

Example:

```
[table compact]
sample
[/table]
```

### [genomemap]…[/genomemap]

Embeds a genome map from a named preset provided via the `genomeMaps` prop.

- Syntax:
  ```
  [genomemap]
  presetName
  [/genomemap]
  ```
- Body: the preset name.
- Props: any additional attributes placed on the opening tag are forwarded to
  the GenomeMap component (e.g., `className="my-map"`).

### [toc]…[/toc]

Renders a table of contents for the markdown embedded inside the macro block.
This is separate from the global `toc` flag, which builds a TOC for the entire
document.

- Syntax:
  ```
  [toc className="my-toc"]
  ## Section A
  ### Subsection
  [/toc]
  ```
- Props: attributes on the opening tag (e.g., `className`) are forwarded to the
  TOC component.

### [refs]…[/refs]

Renders a static list of references by name, using the same reference store as
footnote citations. Each non‑empty line in the body is treated as a reference
name and resolved via `<InlineRef />`.

- Syntax:
  ```
  [refs as="ol" className="my-refs"]
  Foo
  Bar
  Baz
  [/refs]
  ```
- Props:
  - `as`: either `ul` or `ol` (defaults to `ul` on invalid input).
  - `className`, `style`: forwarded to the list element.

Notes:
- Footnote citations use standard GFM footnote syntax `[^Name]` and are not a
  macro. Inline expansions are supported via `[^Name#inline]`.
-

## Differences from CommonMark and GitHub Flavored Markdown

* Macros (`{{table}}`, `{{genome-map}}`, `{{toc}}`) and automatic references are
  not part of the CommonMark specification or GitHub Flavored Markdown.
* Links are not sanitised (`transformLinkUri` is disabled), allowing nonstandard
  protocols that GitHub would filter.
* Raw HTML passes through unescaped, while GitHub strips many tags for safety.

These deviations should be kept in mind when adding new Markdown features or
when porting content from other Markdown processors.

## Testing

All features in `src/components/markdown` are covered by unit tests. The test
suite exercises macros, table of contents generation, collapsible sections and
custom link/image wrappers to ensure reliable behaviour.

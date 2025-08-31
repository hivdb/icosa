import type {Root, Element, ElementContent} from 'hast';

/**
 * Derive heading level (1-6) from a HAST element.
 *
 * @param node - HAST element to inspect.
 * @returns Heading level number or -1 if not a heading.
 */
function getHeadingLevel(node: Element): number {
  const tag = node.tagName?.toLowerCase();
  if (tag && /^h[1-6]$/.test(tag)) {
    return parseInt(tag.slice(1), 10);
  }
  return -1;
}

/**
 * Group sibling HAST nodes into nested md-section elements based on heading levels.
 *
 * @param nodes - List of element contents to group.
 * @param startIdx - Index to start scanning from (inclusive).
 * @param minLevel - Minimum heading level that begins a new section.
 * @returns A tuple of the grouped section nodes and the end index consumed.
 */
function groupSections(
  nodes: ElementContent[],
  startIdx = 0,
  minLevel = 1
): [ElementContent[], number] {
  const sections: ElementContent[] = [];
  let curSectionLevel = 0;
  let curSectionParas: ElementContent[] = [];
  for (let idx = startIdx; idx < nodes.length; idx++) {
    const node = nodes[idx];
    const isElem = (node as Element).type === 'element';
    const level = isElem ? getHeadingLevel(node as Element) : -1;
    if (level < 0) {
      // non-heading node
      curSectionParas.push(node);
    } else if (level >= minLevel) {
      if (curSectionLevel === 0 || level <= curSectionLevel) {
        // new section at current level
        pushSection(sections, curSectionParas, curSectionLevel, startIdx, sections.length);
        curSectionLevel = level;
        curSectionParas = [node];
      } else {
        // subsection: recurse and append nested sections as content
        const [subsections, endIdx] = groupSections(nodes, idx, level);
        idx = endIdx;
        curSectionParas = curSectionParas.concat(subsections);
      }
    } else {
      // encountered a heading above the current level; stop here
      pushSection(sections, curSectionParas, curSectionLevel, startIdx, sections.length);
      return [sections, idx - 1];
    }
  }
  pushSection(sections, curSectionParas, curSectionLevel, startIdx, sections.length);
  return [sections, nodes.length];

  function pushSection(
    out: ElementContent[],
    children: ElementContent[],
    level: number,
    keyStart: number,
    keyIdx: number
  ) {
    if (children.length > 0) {
      out.push({
        type: 'element',
        tagName: 'md-section',
        properties: { level },
        children
      } as Element);
    }
  }
}

/**
 * Rehype plugin that converts a flat list of headings + content into nested
 * md-section elements understood by our renderer. Each `md-section` node will
 * be mapped to a React Collapsable.Section at render time.
 *
 * @returns Transformer that mutates the root tree in-place.
 */
export default function rehypeSectionize() {
  return function transformer(tree: Root) {
    const children = (tree.children ?? []) as ElementContent[];
    const [sections] = groupSections(children);
    // Replace top-level children with the grouped sections
    (tree as Root).children = sections as unknown as Root['children'];
  };
}

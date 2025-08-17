/**
 * Scrolls the given element into view and highlights it temporarily.
 *
 * The element is scrolled to the center of the viewport and a
 * `data-anchor-focused` attribute is set for six seconds so it can be
 * styled via CSS.
 *
 * @param element - The element to focus.
 */
export function focusElement(element: HTMLElement | null | undefined): void {
  if (element) {
    element.scrollIntoView({block: 'center'});
    element.dataset.anchorFocused = 'true';
    setTimeout(() => {
      delete element.dataset.anchorFocused;
    }, 6000);
  }
}

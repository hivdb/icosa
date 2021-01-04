export function focusElement(element) {
  if (element) {
    element.scrollIntoView({block: 'center'});
    element.dataset.anchorFocused = true;
    setTimeout(() => {
      delete element.dataset.anchorFocused;
    }, 6000);
  }
}

const TITLE_SUFFIX = (
  'Stanford Coronavirus Antiviral & Resistance Database (CoVDB)'
);

/**
 * Set the document title with a standard suffix.
 *
 * @param title - Optional page specific title.
 */
export default function setTitle(title?: string): void {
  if (title) {
    document.title = `${title} - ${TITLE_SUFFIX}`;
  }
  else {
    document.title = `${TITLE_SUFFIX}`;
  }
}

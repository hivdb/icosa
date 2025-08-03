const TITLE_SUFFIX =
  'Stanford Coronavirus Antiviral & Resistance Database (CoVDB)';

/**
 * Set the document title with a predefined suffix.
 *
 * @param title - Optional title prefix.
 * @returns void
 */
export default function setTitle(title?: string): void {
  if (title) {
    document.title = `${title} - ${TITLE_SUFFIX}`;
  } else {
    document.title = `${TITLE_SUFFIX}`;
  }
}


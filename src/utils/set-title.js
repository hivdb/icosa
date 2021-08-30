const TITLE_SUFFIX = (
  'Stanford Coronavirus Antiviral & Resistance Database (CoVDB)'
);


export default function setTitle(title) {
  if (title) {
    document.title = `${title} - ${TITLE_SUFFIX}`;
  }
  else {
    document.title = `${TITLE_SUFFIX}`;
  }
}

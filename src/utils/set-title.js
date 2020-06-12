const TITLE_SUFFIX = 'Stanford Coronavirus Antiviral Research Database';


export default function setTitle(title) {
  if (title) {
    document.title = `${title} - ${TITLE_SUFFIX}`;
  }
  else {
    document.title = `${TITLE_SUFFIX}`;
  }
}

export function formatDateTime(text) {
  return new Date(text).toLocaleString(
    'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: 'numeric'
    }
  );
}

export function formatDate(text) {
  return new Date(
    parseInt(text.slice(0, 4)),
    parseInt(text.slice(4, 6) - 1),
    parseInt(text.slice(6, 8))
  ).toLocaleDateString(
    'en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    }
  );
}

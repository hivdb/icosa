export function formatDateTime(text) {
  return text ? new Date(text).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }) : 'Unknown';
}

export function formatDate(text) {
  return text ? new Date(
    parseInt(text.slice(0, 4)),
    parseInt(text.slice(4, 6) - 1),
    parseInt(text.slice(6, 8))
  ).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  }) : 'Unknown';
}

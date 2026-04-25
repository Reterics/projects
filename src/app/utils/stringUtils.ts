export function capitalizeFirstLetter(string: string): string {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function truncateString(string: string, maxLength: number): string {
  if (!string || string.length <= maxLength) return string;
  return string.slice(0, maxLength) + '...';
}

export function slugify(string: string): string {
  return string
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}

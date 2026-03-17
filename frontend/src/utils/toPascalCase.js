export default function toPascalCase(str) {
  return str
    .split(/[-_]/g)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}
type Cell = string | number | null;

const INJECTION_PREFIX = /^[=+\-@\t\r]/;

function escapeCell(cell: Cell): string {
  if (cell === null) return '';
  if (typeof cell === 'number') return String(cell);
  const text = INJECTION_PREFIX.test(cell) ? `'${cell}` : cell;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(headers: string[], rows: Cell[][]): string {
  return `${[headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n')}\r\n`;
}

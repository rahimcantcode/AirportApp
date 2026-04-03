export function randomDigits(count: number): string {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 10)).join('');
}

export function randomAlphaNumUpper(count: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: count }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function normalizeAirlineCode(value: string): string {
  return (value || '').toUpperCase().slice(0, 2);
}

export function parseGate(value: string): { terminal: string; gateNumber: string } {
  const gate = (value || '').trim().toUpperCase();
  const [terminalPart, gatePart] = gate.includes('-') ? gate.split('-', 2) : ['T1', gate];
  const terminal = terminalPart || 'T1';
  const gateNumber = gatePart || gate;
  return { terminal, gateNumber };
}

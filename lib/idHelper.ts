let counter = 0;

export function generateUniqueId(prefix: string): string {
  counter += 1;
  const time = Date.now();
  return `${prefix}_${time}_${counter}_${Math.random().toString(36).substring(2, 7)}`;
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}


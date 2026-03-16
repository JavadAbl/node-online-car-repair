import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

export function getFileExtension(filename: string) {
  if (typeof filename !== 'string') return '';
  // Strip query/hash parts (e.g., "file.tar.gz?x=1#y")
  const base = filename.split(/[?#]/)[0];

  // Get last path segment if a path is provided
  const name = base.split('/').pop();

  // Find the last dot that isn’t the first character (to avoid ".gitignore")
  const lastDot = name!.lastIndexOf('.');

  // No dot or dot is the first char => no extension
  if (lastDot <= 0) return '';

  return name!.slice(lastDot + 1);
}

export function getFileNameAndExt(input: string) {
  if (typeof input !== 'string') return ['', ''];

  // Remove query/hash and normalize slashes
  const base = input.split(/[?#]/)[0].replace(/\\/g, '/');

  // Take last path segment
  const name = base.split('/').pop() || '';

  // Find last dot that isn't the first character
  const i = name.lastIndexOf('.');
  if (i <= 0) return [name, '']; // no extension or hidden file like ".env"

  return [name.slice(0, i), name.slice(i + 1)];
}

export function enumToObject<E extends Record<string, string | number>>(e: E): { [K in keyof E]: E[K] } {
  // Filter out the reverse‑mapping entries that appear only for numeric enums
  const entries = Object.entries(e).filter(
    ([k]) => Number.isNaN(Number(k)), // keep only the named keys
  );

  // `Object.fromEntries` returns `Record<string, unknown>`; we cast to the desired type
  return Object.fromEntries(entries) as { [K in keyof E]: E[K] };
}

export async function validateOrRejectObject<T extends object>(model: new () => T, obj: object) {
  const instance = plainToInstance(model, obj);
  await validateOrReject(instance);
}

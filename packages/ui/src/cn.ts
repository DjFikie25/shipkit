/**
 * Class name merger — compatible with Tailwind CSS.
 * Accepts conditional class strings and deduplicates conflicting utilities.
 *
 * Usage: cn('px-4', condition && 'font-bold', 'py-2 py-4')
 *        → 'px-4 py-4'  (py-2 overridden by py-4 via tailwind-merge)
 */

type ClassValue = string | null | undefined | false | ClassValue[];

function flat(value: ClassValue): string {
  if (!value) return '';
  if (Array.isArray(value)) return value.map(flat).filter(Boolean).join(' ');
  return value;
}

export function cn(...inputs: ClassValue[]): string {
  // We do a best-effort merge without tailwind-merge so this package has zero deps.
  // In apps that use tailwind-merge, import `cn` directly from there.
  return inputs.map(flat).filter(Boolean).join(' ').trim();
}

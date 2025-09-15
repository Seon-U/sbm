import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// export const newToken = () => v4

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DynamicCsses = [
  'translate-x-[-20px]',
  'translate-x-[-40px]',
  'translate-x-[-60px]',
  'translate-x-[-80px]',
  'translate-x-[-100px]',
  'translate-x-[-120px]',
];

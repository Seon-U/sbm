import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuid } from 'uuid';

export { default as DummyProfile } from '@/public/dummy-profile.png';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const newToken = () => uuid();

export const uniqId = (cnt = 5) =>
  Math.random()
    .toString(36)
    .substring(2, cnt + 2);

export const uniqNumId = (cnt = 5) =>
  Math.random()
    .toString(10)
    .substring(2, cnt + 2);

export const DynamicCsses = [
  'translate-x-[-20px]',
  'translate-x-[-40px]',
  'translate-x-[-60px]',
  'translate-x-[-80px]',
  'translate-x-[-100px]',
  'translate-x-[-120px]',
];

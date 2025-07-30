import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function assetUrl(path: string) {
  if (!path || typeof path !== 'string') {
    console.warn('assetUrl: Invalid path provided:', path);
    return '';
  }
  
  const base = import.meta.env.BASE_URL || '/'
  const baseTrimmed = base.endsWith('/') ? base.slice(0, -1) : base
  const trimmed = path.startsWith('/') ? path.slice(1) : path
  return `${baseTrimmed}/${trimmed}`
}

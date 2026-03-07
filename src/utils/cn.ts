import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusiona de manera segura clases condicionales de Tailwind.
 * Usa `clsx` para resolver lógica booleana y `twMerge` para resolver colisiones de Tailwind.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
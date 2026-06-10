import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function pickBestPinterestImage(
  images: Record<string, { url: string; width: number; height: number }>
): { url: string; width: number; height: number } {
  return (
    images["600x"] ||
    images["400x300"] ||
    images["1200x"] ||
    images["236x"] ||
    Object.values(images)[0]
  );
}

export const GROUP_COLORS = [
  { label: "Ash", value: "rgba(120,120,120,0.12)", border: "rgba(120,120,120,0.4)" },
  { label: "Rose", value: "rgba(220,80,80,0.10)", border: "rgba(220,80,80,0.4)" },
  { label: "Violet", value: "rgba(130,80,220,0.10)", border: "rgba(130,80,220,0.4)" },
  { label: "Sky", value: "rgba(60,140,220,0.10)", border: "rgba(60,140,220,0.4)" },
  { label: "Mint", value: "rgba(60,180,130,0.10)", border: "rgba(60,180,130,0.4)" },
  { label: "Amber", value: "rgba(220,160,40,0.10)", border: "rgba(220,160,40,0.4)" },
];

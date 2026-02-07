export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function randInt(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export function randFloat(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function jitter(value: number, amt: number) {
  return value + (Math.random() * 2 - 1) * amt;
}

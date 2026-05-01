export async function pause(time: number) {
  return new Promise((res) => setTimeout(() => res(undefined), time));
}

export function generateFactorNumber() {
  return `FACTOR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function percentOf(value: number, percent: number) {
  return (value * percent) / 100;
}

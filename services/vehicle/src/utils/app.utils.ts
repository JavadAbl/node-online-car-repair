export async function pause(time: number) {
  return new Promise((res) => setTimeout(() => res(undefined), time));
}

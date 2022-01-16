export function create(fn: CallableFunction, count = 1) {
  const data = [];

  for (let i = 0; i < count; i++) {
    data.push(fn());
  }

  return data;
}

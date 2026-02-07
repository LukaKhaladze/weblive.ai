export function updateByPath(obj: any, path: string, value: any) {
  const keys = path.split(".");
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  let current: any = clone;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      current[key] = value;
      return;
    }
    const next = current[key];
    current[key] = Array.isArray(next) ? [...next] : { ...next };
    current = current[key];
  });
  return clone;
}

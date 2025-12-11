export function buildPath(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(.*?)\}/g, (_, key: string) => encodeURIComponent(String(params[key] ?? "")));
}


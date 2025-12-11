export interface CredentialOptions {
  apiKey?: string;
  clientId?: string;
  origin?: string;
}

export function buildCredentialHeaders(options: CredentialOptions): Record<string, string> {
  const headers: Record<string, string> = {};
  if (options.apiKey) headers["x-api-key"] = options.apiKey;
  if (options.clientId) headers["x-client-id"] = options.clientId;
  if (options.origin) headers["Origin"] = options.origin;
  return headers;
}


export interface CredentialOptions {
  apiKey?: string;
  clientId?: string;
  /** Request Network orchestrator API key. It is sent only as x-orchestrator-key. */
  orchestratorKey?: string;
  origin?: string;
}

export function buildCredentialHeaders(options: CredentialOptions): Record<string, string> {
  const headers: Record<string, string> = {};
  if (options.apiKey) headers["x-api-key"] = options.apiKey;
  if (options.clientId) headers["x-client-id"] = options.clientId;
  if (options.orchestratorKey) headers["x-orchestrator-key"] = options.orchestratorKey;
  if (options.origin) headers["Origin"] = options.origin;
  return headers;
}

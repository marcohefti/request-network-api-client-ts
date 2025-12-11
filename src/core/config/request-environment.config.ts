export const RequestEnvironment = {
  production: "https://api.request.network",
  // Legacy placeholder for partner-managed sandboxes; Request does not operate a public staging host.
  staging: "https://api.stage.request.network",
  local: "http://127.0.0.1:8080",
} as const;

export type RequestEnvironmentName = keyof typeof RequestEnvironment;

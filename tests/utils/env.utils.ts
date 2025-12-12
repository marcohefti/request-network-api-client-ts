import { describe, test } from "vitest";

import { createRequestClient, type RequestClient } from "../../src";
import type { CreateClientOptions } from "../../src/core/http/client.factory";

const LIVE_SUITE_LABEL = "Live integration suite";

const BASE_ENV_VARS = {
  apiKey: "REQUEST_API_KEY",
  clientId: "REQUEST_CLIENT_ID",
  baseUrl: "REQUEST_API_URL",
} as const;

interface LoadSuiteOptions {
  requireClientId?: boolean;
  env?: NodeJS.ProcessEnv;
}

export interface SuiteEnv {
  label: string;
  baseUrl: string;
  apiKey?: string;
  clientId?: string;
  missing: string[];
  shouldRun: boolean;
  createClient(overrides?: Partial<CreateClientOptions>): RequestClient;
  describeMissing(): string;
}

function resolveBaseUrl(env: NodeJS.ProcessEnv, fallback: string): string {
  const value = env[BASE_ENV_VARS.baseUrl];
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  return fallback;
}

function loadLiveSuiteEnvInternal(options: LoadSuiteOptions = {}): SuiteEnv {
  const env = options.env ?? process.env;
  const requireClientId = options.requireClientId ?? false;

  const label = LIVE_SUITE_LABEL;
  const fallbackBaseUrl = "https://api.request.network";
  const baseUrl = resolveBaseUrl(env, fallbackBaseUrl);
  const apiKey = env[BASE_ENV_VARS.apiKey]?.trim();
  const clientId = env[BASE_ENV_VARS.clientId]?.trim();

  const missing: string[] = [];
  if (!apiKey) missing.push(BASE_ENV_VARS.apiKey);
  if (requireClientId && !clientId) missing.push(BASE_ENV_VARS.clientId);

  return {
    label,
    baseUrl,
    apiKey,
    clientId,
    missing,
    shouldRun: missing.length === 0,
    createClient(overrides?: Partial<CreateClientOptions>): RequestClient {
      return createRequestClient({
        baseUrl,
        apiKey,
        clientId,
        ...overrides,
      });
    },
    describeMissing(): string {
      if (missing.length === 0) return "";
      const missingList = missing.join(", ");
      return `[${label}] missing environment variable${missing.length > 1 ? "s" : ""}: ${missingList}`;
    },
  };
}

export function loadLiveSuiteEnv(options?: LoadSuiteOptions): SuiteEnv {
  return loadLiveSuiteEnvInternal(options);
}

export function skipSuiteIfMissing(env: SuiteEnv): boolean {
  if (env.shouldRun) {
    return false;
  }
  const message = env.describeMissing();
  if (message) {
    process.stderr.write(`${message}\n`);
  }
  describe.skip(env.label, () => {
    const skipMessage = message || `${env.label} skipped`;
    test.skip(skipMessage, () => {
      /* intentionally empty */
    });
  });
  return true;
}

/**
 * Ensures the integration suite has required credentials. Returns the env when
 * present, otherwise registers a skipped suite and short-circuits the caller.
 */
export function ensureSuite(env: SuiteEnv): SuiteEnv | undefined {
  if (skipSuiteIfMissing(env)) return undefined;
  return env;
}

export function ensureLiveSuite(options?: LoadSuiteOptions): SuiteEnv | undefined {
  return ensureSuite(loadLiveSuiteEnv(options));
}

export function requireSuiteOrThrow(env: SuiteEnv): SuiteEnv {
  if (!env.shouldRun) {
    const message = env.describeMissing();
    throw new Error(message || `Missing required environment for ${env.label}`);
  }
  return env;
}

export function createClientFromEnv(
  env: SuiteEnv,
  overrides?: Partial<CreateClientOptions>,
): RequestClient {
  return env.createClient(overrides);
}

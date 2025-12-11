import type { RuntimeValidationConfig, RuntimeValidationOption } from "./http.types";

const DEFAULT_RUNTIME_VALIDATION: RuntimeValidationConfig = {
  requests: true,
  responses: true,
  errors: true,
};

function normaliseBoolean(flag: boolean | undefined, fallback: boolean): boolean {
  return typeof flag === "boolean" ? flag : fallback;
}

export function normaliseRuntimeValidation(option?: RuntimeValidationOption): RuntimeValidationConfig {
  if (typeof option === "boolean") {
    return {
      requests: option,
      responses: option,
      errors: option,
    } satisfies RuntimeValidationConfig;
  }

  return {
    requests: normaliseBoolean(option?.requests, DEFAULT_RUNTIME_VALIDATION.requests),
    responses: normaliseBoolean(option?.responses, DEFAULT_RUNTIME_VALIDATION.responses),
    errors: normaliseBoolean(option?.errors, DEFAULT_RUNTIME_VALIDATION.errors),
  } satisfies RuntimeValidationConfig;
}

export function mergeRuntimeValidation(base: RuntimeValidationConfig, override?: RuntimeValidationOption): RuntimeValidationConfig {
  if (override === undefined) {
    return base;
  }

  if (typeof override === "boolean") {
    return {
      requests: override,
      responses: override,
      errors: override,
    } satisfies RuntimeValidationConfig;
  }

  return {
    requests: normaliseBoolean(override.requests, base.requests),
    responses: normaliseBoolean(override.responses, base.responses),
    errors: normaliseBoolean(override.errors, base.errors),
  } satisfies RuntimeValidationConfig;
}

export function cloneRuntimeValidation(config: RuntimeValidationConfig): RuntimeValidationConfig {
  return { ...config };
}

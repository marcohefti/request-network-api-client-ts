const BASE_FEE_TYPES = ["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"];
const PROTOCOL_FEE_TYPE = "protocol";
const FEE_AMOUNT_KEYS = ["amount", "amountInUSD", "amountInUsd"];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasKnownFeeTypeEnum(schema) {
  if (!isObject(schema) || !isObject(schema.properties)) {
    return false;
  }

  const typeSchema = schema.properties.type;
  if (!isObject(typeSchema) || !Array.isArray(typeSchema.enum)) {
    return false;
  }

  return BASE_FEE_TYPES.every((value) => typeSchema.enum.includes(value));
}

function patchFeeSchema(schema, stats) {
  const typeSchema = schema.properties.type;
  if (Array.isArray(typeSchema.enum) && !typeSchema.enum.includes(PROTOCOL_FEE_TYPE)) {
    typeSchema.enum = [...typeSchema.enum, PROTOCOL_FEE_TYPE];
    stats.enumPatchedCount += 1;
  }

  for (const key of FEE_AMOUNT_KEYS) {
    const amountSchema = schema.properties[key];
    if (!isObject(amountSchema)) {
      continue;
    }

    if (amountSchema.type === "string" && amountSchema.nullable !== true) {
      amountSchema.nullable = true;
      stats.nullablePatchedCount += 1;
    }
  }
}

function walkAndPatch(node, stats) {
  if (Array.isArray(node)) {
    for (const item of node) {
      walkAndPatch(item, stats);
    }
    return;
  }

  if (!isObject(node)) {
    return;
  }

  if (hasKnownFeeTypeEnum(node)) {
    patchFeeSchema(node, stats);
  }

  for (const value of Object.values(node)) {
    walkAndPatch(value, stats);
  }
}

export function applyOpenApiDriftPatches(spec) {
  const stats = {
    enumPatchedCount: 0,
    nullablePatchedCount: 0,
  };

  walkAndPatch(spec, stats);

  return {
    ...stats,
    mutationCount: stats.enumPatchedCount + stats.nullablePatchedCount,
  };
}

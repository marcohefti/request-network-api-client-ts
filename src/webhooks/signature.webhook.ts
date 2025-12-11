import { Buffer } from "node:buffer";
import { createHmac, timingSafeEqual } from "node:crypto";

import { RequestWebhookSignatureError } from "./errors.webhook";
import { normaliseHeaders, pickHeader, type NormalisedHeaders, type WebhookHeaders } from "./headers.webhook";

export const DEFAULT_SIGNATURE_HEADER = "x-request-network-signature";
export const DEFAULT_SIGNATURE_ALGORITHM = "sha256";

export interface VerifyWebhookSignatureOptions {
  readonly rawBody: ArrayBuffer | ArrayBufferView | string;
  readonly secret: string | readonly string[];
  readonly headers?: WebhookHeaders;
  readonly signature?: string;
  readonly headerName?: string;
  readonly toleranceMs?: number;
  readonly timestamp?: number;
  readonly timestampHeader?: string;
  readonly now?: () => number;
}

export interface VerifyWebhookSignatureResult {
  /**
   * Normalised (lowercase hex) signature taken from the request.
   */
  signature: string;
  /**
   * Secret that successfully matched the signature. Useful for rotation.
   */
  matchedSecret: string;
  /**
   * Parsed timestamp in milliseconds (when provided).
   */
  timestamp: number | null;
  /**
   * Headers used during verification, normalised to lowercase keys.
   */
  headers: NormalisedHeaders;
}

const HEX_SIGNATURE_PATTERN = /^[0-9a-f]+$/i;

function toBuffer(rawBody: ArrayBuffer | ArrayBufferView | string): Buffer {
  if (typeof rawBody === "string") {
    return Buffer.from(rawBody, "utf8");
  }
  if (rawBody instanceof ArrayBuffer) {
    return Buffer.from(rawBody);
  }
  return Buffer.from(rawBody.buffer, rawBody.byteOffset, rawBody.byteLength);
}

function stripAlgorithmPrefix(signature: string, headerName: string): string {
  const trimmed = signature.trim();
  const equalityIndex = trimmed.indexOf("=");
  if (equalityIndex === -1) {
    return trimmed;
  }
  const prefix = trimmed.slice(0, equalityIndex).toLowerCase();
  if (prefix !== DEFAULT_SIGNATURE_ALGORITHM) {
    throw new RequestWebhookSignatureError("Unsupported signature algorithm", {
      headerName,
      signature: signature,
      timestamp: null,
      reason: "invalid_format",
    });
  }
  return trimmed.slice(equalityIndex + 1);
}

function parseSignatureValue(signature: string, headerName: string): { normalisedHex: string; buffer: Buffer } {
  const stripped = stripAlgorithmPrefix(signature, headerName);
  const trimmed = stripped.trim();
  if (!trimmed || !HEX_SIGNATURE_PATTERN.test(trimmed)) {
    throw new RequestWebhookSignatureError("Invalid webhook signature format", {
      headerName,
      signature,
      timestamp: null,
      reason: "invalid_format",
    });
  }

  const lower = trimmed.toLowerCase();
  if (lower.length % 2 !== 0) {
    throw new RequestWebhookSignatureError("Invalid webhook signature length", {
      headerName,
      signature,
      timestamp: null,
      reason: "invalid_format",
    });
  }

  const digest = Buffer.from(lower, "hex");
  return { normalisedHex: lower, buffer: digest };
}

function computeHmac(secret: string, body: Buffer): Buffer {
  return createHmac(DEFAULT_SIGNATURE_ALGORITHM, secret).update(body).digest();
}

function isReadonlyStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value);
}

function toSecretArray(secret: string | readonly string[]): string[] {
  return isReadonlyStringArray(secret) ? [...secret] : [secret];
}

function parseTimestamp(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric)) {
      return null;
    }
    // Heuristic: seconds vs milliseconds based on magnitude.
    if (numeric > 1e12) {
      return Math.trunc(numeric);
    }
    if (numeric > 1e9) {
      return Math.trunc(numeric);
    }
    return Math.trunc(numeric * 1000);
  }

  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
}

function resolveTimestamp(options: VerifyWebhookSignatureOptions, headers: NormalisedHeaders, headerName: string): number | null {
  if (typeof options.timestamp === "number") {
    return options.timestamp;
  }
  if (!options.timestampHeader) {
    return null;
  }
  const headerValue = pickHeader(headers, options.timestampHeader);
  if (!headerValue) {
    return null;
  }
  const parsed = parseTimestamp(headerValue);
  if (parsed == null) {
    throw new RequestWebhookSignatureError("Invalid webhook timestamp header", {
      headerName: options.timestampHeader,
      signature: pickHeader(headers, headerName) ?? null,
      timestamp: null,
      reason: "invalid_format",
    });
  }
  return parsed;
}

export function verifyWebhookSignature(options: VerifyWebhookSignatureOptions): VerifyWebhookSignatureResult {
  const {
    rawBody,
    secret,
    headers: rawHeaders,
    signature: explicitSignature,
    headerName = DEFAULT_SIGNATURE_HEADER,
    toleranceMs,
    now = () => Date.now(),
  } = options;

  const headers = normaliseHeaders(rawHeaders);
  const signatureValue = explicitSignature ?? pickHeader(headers, headerName);
  if (!signatureValue) {
    throw new RequestWebhookSignatureError(`Missing webhook signature header: ${headerName}`, {
      headerName,
      signature: null,
      timestamp: null,
      reason: "missing_signature",
    });
  }

  const { normalisedHex, buffer: signatureBuffer } = parseSignatureValue(signatureValue, headerName);

  const timestamp = resolveTimestamp(options, headers, headerName);
  if (typeof toleranceMs === "number" && toleranceMs >= 0 && timestamp != null) {
    const distance = Math.abs(now() - timestamp);
    if (distance > toleranceMs) {
      throw new RequestWebhookSignatureError("Webhook signature timestamp outside tolerance", {
        headerName,
        signature: normalisedHex,
        timestamp,
        reason: "tolerance_exceeded",
      });
    }
  }

  const bodyBuffer = toBuffer(rawBody);
  const secrets = toSecretArray(secret);
  if (secrets.length === 0) {
    throw new RequestWebhookSignatureError("No webhook secrets configured", {
      headerName,
      signature: normalisedHex,
      timestamp,
      reason: "invalid_signature",
    });
  }

  const digests = secrets.map((candidate) => computeHmac(candidate, bodyBuffer));
  const digestLength = digests[0].length;

  if (signatureBuffer.length !== digestLength) {
    throw new RequestWebhookSignatureError("Webhook signature length mismatch", {
      headerName,
      signature: normalisedHex,
      timestamp,
      reason: "invalid_format",
    });
  }

  for (let index = 0; index < digests.length; index += 1) {
    const digest = digests[index];
    if (timingSafeEqual(signatureBuffer, digest)) {
      return {
        signature: normalisedHex,
        matchedSecret: secrets[index],
        timestamp: timestamp ?? null,
        headers,
      };
    }
  }

  throw new RequestWebhookSignatureError("Invalid webhook signature", {
    headerName,
    signature: normalisedHex,
    timestamp,
    reason: "invalid_signature",
  });
}

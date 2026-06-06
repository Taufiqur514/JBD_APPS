export type JbdRole = "customer" | "admin" | "finance" | "warehouse" | "seller";

type SessionPayload = {
  role: JbdRole;
  userId: string;
  expiresAt: number;
};

const encoder = new TextEncoder();

function toBase64Url(value: Uint8Array | string) {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function signingKey() {
  const secret = process.env.JBD_AUTH_SECRET ?? "jbd-prototype-local-secret-change-before-production";
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function createSessionToken(role: JbdRole, userId: string) {
  const payload: SessionPayload = {
    role,
    userId,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = await crypto.subtle.sign("HMAC", await signingKey(), encoder.encode(encodedPayload));
  return `${encodedPayload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  const [encodedPayload, encodedSignature] = token.split(".");
  if (!encodedPayload || !encodedSignature) return null;
  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await signingKey(),
      fromBase64Url(encodedSignature),
      encoder.encode(encodedPayload),
    );
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encodedPayload))) as SessionPayload;
    return payload.expiresAt > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

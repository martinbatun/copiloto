// bcryptjs y jsonwebtoken son CJS — con import default + esModuleInterop el
// type-check chillaba (TS1192). Importar las funciones por nombre via require
// CJS-tipado por @types/* es lo unico que funciona simultaneamente en
// type-check (TS strict ESM) y runtime (tsx ESM con CJS interop).
import bcryptjs from "bcryptjs";
import jsonwebtoken, { type SignOptions } from "jsonwebtoken";
import type { Role } from "@copiloto/shared";

// tsx wrapea el CJS bajo .default cuando llega a runtime — desempaquetamos
// con un fallback al modulo crudo para que funcione en ambos casos.
const bcrypt: typeof bcryptjs =
  (bcryptjs as unknown as { default?: typeof bcryptjs }).default ?? bcryptjs;
const jwt: typeof jsonwebtoken =
  (jsonwebtoken as unknown as { default?: typeof jsonwebtoken }).default ??
  jsonwebtoken;

export interface JwtPayload {
  sub: string; // user id
  tenantId: string; // multi-tenant scoping (operador puede tener >1 sucursal)
  role: Role;
  email: string;
}

const DEFAULT_TTL: SignOptions["expiresIn"] = "7d";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signJwt(
  payload: JwtPayload,
  secret: string,
  ttl: SignOptions["expiresIn"] = DEFAULT_TTL
): string {
  // jsonwebtoken v9 endurecio el tipo de expiresIn (number | "7d" tipado).
  // Casteamos el options a SignOptions para mantener la API ergonomica sin any.
  const opts: SignOptions = { expiresIn: ttl };
  return jwt.sign(payload, secret, opts);
}

export function verifyJwt(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Role } from "@copiloto/shared";

export interface JwtPayload {
  sub: string;       // user id
  tenantId: string;  // multi-tenant scoping (operador puede tener >1 sucursal)
  role: Role;
  email: string;
}

const DEFAULT_TTL = "7d";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signJwt(payload: JwtPayload, secret: string, ttl = DEFAULT_TTL): string {
  return jwt.sign(payload, secret, { expiresIn: ttl });
}

export function verifyJwt(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}

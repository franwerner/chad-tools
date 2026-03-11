import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_EXPIRY = 24 * 60 * 60;
export interface UserEntry {
  hash: string;
}

export class AuthService {
  private secret: string;
  private users: Record<string, UserEntry>;
  private salt: string;

  constructor(opts: { secret: string; users: Record<string, UserEntry>, salt: string }) {
    this.secret = opts.secret;
    this.salt = opts.salt;
    this.users = opts.users;
  }

  jwtSign(payload: Record<string, unknown>) {
    return jwt.sign(payload, this.secret, { expiresIn: JWT_EXPIRY });
  }

  jwtVerify(token: string): Record<string, any> | null {
    try {
      return jwt.verify(token, this.secret) as Record<string, any>;
    } catch {
      return null;
    }
  }

  getUsers(): string[] {
    return Object.keys(this.users);
  }

  verifyCredentials(user: string, password: string): boolean {
    const entry = this.users[user];
    if (!entry) return false;
    const hash = crypto.createHash("sha256").update(this.salt + password).digest("hex");
    return entry.hash === hash;
  }

  get expiry() {
    return JWT_EXPIRY;
  }
}

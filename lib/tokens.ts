import crypto from "crypto";
import { nanoid } from "nanoid";

export function generateEditToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function generateShareSlug() {
  return nanoid(10);
}

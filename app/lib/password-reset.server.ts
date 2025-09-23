import { prisma } from "./db.server";
import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";

function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export async function createPasswordResetToken(userId: string, ttlMinutes = 30) {
  const raw = randomBytes(32).toString("hex");
  const token = hashToken(raw);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
  await prisma.passwordResetToken.create({ data: { userId, token, expiresAt } });
  return raw; // return raw token to send via email
}

export async function verifyPasswordResetToken(rawToken: string) {
  const token = hashToken(rawToken);
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record) return null;
  if (record.expiresAt < new Date()) return null;
  return record;
}

export async function consumePasswordResetToken(rawToken: string) {
  const token = hashToken(rawToken);
  await prisma.passwordResetToken.delete({ where: { token } }).catch(() => {});
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}



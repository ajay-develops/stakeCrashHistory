import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

// Load key from environment variable
const APP_ENCRYPTION_KEY = process.env.APP_ENCRYPTION_KEY!;
if (!APP_ENCRYPTION_KEY || APP_ENCRYPTION_KEY.length !== 32) {
  throw new Error(
    "APP_ENCRYPTION_KEY must be a 32-character hex string (16 bytes)"
  );
}

/**
 * Encrypts a string using AES-256-CBC.
 * @param text - The plaintext string to encrypt.
 * @returns Encrypted string in format: iv:encrypted
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16); // 16-byte IV
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(APP_ENCRYPTION_KEY, "hex"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts a string using AES-256-CBC.
 * @param encryptedText - The encrypted string in format: iv:encrypted
 * @returns The decrypted string (plaintext).
 */
export function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(APP_ENCRYPTION_KEY, "hex"),
    iv
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

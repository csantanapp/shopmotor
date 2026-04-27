import { createCipheriv, createDecipheriv, createHmac } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be a 64-char hex string (32 bytes).");
  }
  return Buffer.from(key, "hex");
}

// IV derivado deterministicamente do valor — garante que o mesmo CPF/CNPJ
// sempre produza o mesmo ciphertext, preservando @unique no banco.
function deriveIv(value: string): Buffer {
  const key = getKey();
  return Buffer.from(
    createHmac("sha256", key).update(value).digest()
  ).slice(0, 12);
}

export function encrypt(value: string): string {
  const key = getKey();
  const iv = deriveIv(value);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(value: string): string {
  const key = getKey();
  const parts = value.split(":");
  if (parts.length !== 3) return value; // fallback para texto plano legado
  const [ivHex, tagHex, encHex] = parts;
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(encHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}

// Tenta descriptografar — se falhar (legado plaintext), retorna o valor original
export function safeDecrypt(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return value.includes(":") ? decrypt(value) : value;
  } catch {
    return value;
  }
}

// Mascara CPF/CNPJ para exibição (ex: "***.***.***-XX" ou "**.***.***/***/XX")
export function maskCpf(cpf: string): string {
  const d = cpf.replace(/\D/g, "");
  if (d.length === 11) return `***.***.***-${d.slice(9)}`;
  if (d.length === 14) return `**.***.***/${d.slice(8, 12)}-${d.slice(12)}`;
  return "***";
}

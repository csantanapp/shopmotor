// Validação de upload de imagens — extensão + MIME type + magic bytes
import path from "path";

const ALLOWED_MIME: Record<string, string[]> = {
  ".jpg":  ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png":  ["image/png"],
  ".webp": ["image/webp"],
  ".gif":  ["image/gif"],
};

// Magic bytes (assinatura binária dos formatos)
const MAGIC: Array<{ mime: string; bytes: number[]; offset?: number }> = [
  { mime: "image/jpeg", bytes: [0xFF, 0xD8, 0xFF] },
  { mime: "image/png",  bytes: [0x89, 0x50, 0x4E, 0x47] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF header
  { mime: "image/gif",  bytes: [0x47, 0x49, 0x46] },                   // GIF
];

function detectMime(buffer: Buffer): string | null {
  for (const sig of MAGIC) {
    const offset = sig.offset ?? 0;
    const match = sig.bytes.every((b, i) => buffer[offset + i] === b);
    // WebP também requer "WEBP" nos bytes 8-11
    if (match && sig.mime === "image/webp") {
      const webp = buffer.slice(8, 12).toString("ascii") === "WEBP";
      if (webp) return "image/webp";
      continue;
    }
    if (match) return sig.mime;
  }
  return null;
}

export interface UploadValidationError {
  error: string;
  status: number;
}

export async function validateImageUpload(
  file: File,
  options: { maxBytes?: number; allowGif?: boolean } = {}
): Promise<{ buffer: Buffer; ext: string; mime: string } | UploadValidationError> {
  const { maxBytes = 5 * 1024 * 1024, allowGif = false } = options;

  // 1. Tamanho
  if (file.size > maxBytes) {
    const mb = maxBytes / 1024 / 1024;
    return { error: `Arquivo deve ter no máximo ${mb}MB.`, status: 400 };
  }

  // 2. Extensão
  const ext = path.extname(file.name).toLowerCase();
  const allowedExts = allowGif
    ? [".jpg", ".jpeg", ".png", ".webp", ".gif"]
    : [".jpg", ".jpeg", ".png", ".webp"];

  if (!allowedExts.includes(ext)) {
    return { error: `Formato ${ext} não permitido.`, status: 400 };
  }

  // 3. MIME type declarado pelo cliente
  const clientMime = file.type;
  if (clientMime && !ALLOWED_MIME[ext]?.includes(clientMime)) {
    return { error: "Tipo de arquivo inválido.", status: 400 };
  }

  // 4. Magic bytes — verifica o conteúdo real do arquivo
  const buffer = Buffer.from(await file.arrayBuffer());
  const realMime = detectMime(buffer);

  if (!realMime) {
    return { error: "Arquivo não reconhecido como imagem válida.", status: 400 };
  }

  if (!ALLOWED_MIME[ext]?.includes(realMime)) {
    return { error: "Conteúdo do arquivo não corresponde à extensão.", status: 400 };
  }

  return { buffer, ext, mime: realMime };
}

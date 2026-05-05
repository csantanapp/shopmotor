/**
 * OLX Autos API — cliente placeholder.
 *
 * Para ativar:
 *   1. Solicitar credenciais em https://developer.olx.com.br (parceria B2B)
 *   2. Definir no .env:
 *        OLX_CLIENT_ID=...
 *        OLX_CLIENT_SECRET=...
 *        OLX_BASE_URL=https://api.olx.com.br   (ou URL do sandbox)
 *   3. Descomentar os blocos marcados com [IMPLEMENTAR]
 */

export interface OlxVehiclePayload {
  title: string;
  description: string;
  price: number;
  brand: string;
  model: string;
  yearFab: number;
  yearModel: number;
  km: number;
  fuel: string;
  transmission: string;
  color?: string;
  city: string;
  state: string;
  photos: string[]; // URLs públicas das fotos
}

export interface OlxPublishResult {
  olxAdId: string;
  olxUrl: string;
}

export interface OlxLead {
  olxAdId: string;
  buyerName: string;
  buyerPhone?: string;
  buyerEmail?: string;
  message?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Auth (OAuth2 client_credentials)
// ---------------------------------------------------------------------------

// Cache de token — preenchido pelo getAccessToken quando integração for ativada
const _tokenCacheHolder: { value: { token: string; expiresAt: number } | null } = { value: null };

async function getAccessToken(): Promise<string> {
  const cached = _tokenCacheHolder.value;
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached.token;

  const clientId     = process.env.OLX_CLIENT_ID;
  const clientSecret = process.env.OLX_CLIENT_SECRET;
  const baseUrl      = process.env.OLX_BASE_URL;

  if (!clientId || !clientSecret || !baseUrl) {
    throw new Error("OLX não configurado. Defina OLX_CLIENT_ID, OLX_CLIENT_SECRET e OLX_BASE_URL no .env");
  }

  // [IMPLEMENTAR] Descomentar quando tiver credenciais reais:
  // const res = await fetch(`${baseUrl}/oauth/token`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/x-www-form-urlencoded" },
  //   body: new URLSearchParams({
  //     grant_type: "client_credentials",
  //     client_id: clientId,
  //     client_secret: clientSecret,
  //     scope: "autoad",
  //   }),
  // });
  // if (!res.ok) throw new Error(`OLX auth falhou: ${res.status}`);
  // const data = await res.json();
  // _tokenCacheHolder.value = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  // return _tokenCacheHolder.value.token;

  throw new Error("OLX não configurado — adicione as credenciais no .env");
}

// ---------------------------------------------------------------------------
// Publicar anúncio
// ---------------------------------------------------------------------------

export async function publishVehicle(_payload: OlxVehiclePayload): Promise<OlxPublishResult> {
  const _token = await getAccessToken();
  const _baseUrl = process.env.OLX_BASE_URL;

  // [IMPLEMENTAR] Mapear payload para o formato da OLX Autos API e fazer POST /ads
  // [IMPLEMENTAR] — ver comentários acima
  void _token; void _baseUrl;
  throw new Error("OLX não configurado");
}

// ---------------------------------------------------------------------------
// Pausar anúncio
// ---------------------------------------------------------------------------

export async function pauseVehicle(olxAdId: string): Promise<void> {
  const _token = await getAccessToken();
  const _baseUrl = process.env.OLX_BASE_URL;

  // [IMPLEMENTAR]
  // await fetch(`${_baseUrl}/ads/${olxAdId}/pause`, {
  //   method: "PATCH",
  //   headers: { Authorization: `Bearer ${_token}` },
  // });

  void _token; void _baseUrl; void olxAdId;
  throw new Error("OLX não configurado");
}

// ---------------------------------------------------------------------------
// Remover anúncio
// ---------------------------------------------------------------------------

export async function removeVehicle(olxAdId: string): Promise<void> {
  const _token = await getAccessToken();
  const _baseUrl = process.env.OLX_BASE_URL;

  // [IMPLEMENTAR]
  // await fetch(`${_baseUrl}/ads/${olxAdId}`, {
  //   method: "DELETE",
  //   headers: { Authorization: `Bearer ${_token}` },
  // });

  void _token; void _baseUrl; void olxAdId;
  throw new Error("OLX não configurado");
}

// ---------------------------------------------------------------------------
// Verificar se OLX está configurado (usado na UI para mostrar/ocultar botão)
// ---------------------------------------------------------------------------

export function isOlxConfigured(): boolean {
  return !!(
    process.env.OLX_CLIENT_ID &&
    process.env.OLX_CLIENT_SECRET &&
    process.env.OLX_BASE_URL
  );
}

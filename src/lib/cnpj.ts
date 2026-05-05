/**
 * Valida CNPJ com dígitos verificadores completos.
 * Rejeita sequências de dígitos iguais (ex: 00000000000000) e qualquer CNPJ com dígitos incorretos.
 */
export function validateCNPJ(cnpj: string): boolean {
  const c = cnpj.replace(/\D/g, "");
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;

  const calcDigit = (digits: string, weights: number[]) => {
    const sum = weights.reduce((s, w, i) => s + Number(digits[i]) * w, 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  return calcDigit(c, w1) === Number(c[12]) && calcDigit(c, w2) === Number(c[13]);
}

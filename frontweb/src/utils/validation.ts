export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Portuguese NIF: 9 digits, last digit is a mod-11 check digit.
export function isValidNIF(nif: string): boolean {
  if (!/^\d{9}$/.test(nif)) {
    return false;
  }

  const digits = nif.split('').map(Number);
  const checkDigit = digits[8];

  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += digits[i] * (9 - i);
  }

  const remainder = sum % 11;
  const expectedCheckDigit = remainder < 2 ? 0 : 11 - remainder;

  return checkDigit === expectedCheckDigit;
}

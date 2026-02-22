export function formatAddress(fullAddress: string): string {
  if (!fullAddress || fullAddress === 'Address not found') {
    return fullAddress;
  }

  const parts = fullAddress.split(',').map(p => p.trim());
  
  const postalCodeIndex = parts.findIndex(part => {
    return /\b\d{4,6}\b/.test(part) ||
           /\b\d{5}\s?\d{0,4}\b/.test(part) ||
           /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\b/i.test(part);
  });

  if (postalCodeIndex !== -1) {
    return parts.slice(0, postalCodeIndex + 1).join(', ');
  }

  const relevantParts = parts.slice(0, -1);
  return relevantParts.join(', ') || fullAddress;
}

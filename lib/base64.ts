export function getBase64PayloadSize(base64Data: string): number {
  // Base64 encodes every 3 bytes into 4 chars, so decoded size is len*3/4 minus '=' padding bytes.
  const sanitized = base64Data.replace(/\s/g, "");
  const paddingLength = sanitized.endsWith("==") ? 2 : sanitized.endsWith("=") ? 1 : 0;
  return Math.floor((sanitized.length * 3) / 4) - paddingLength;
}

// Generates a MongoDB ObjectId-compatible hex string (24 chars).
// This is safe for client-side id generation and can be cast on the backend via mongoose.Types.ObjectId(id).
export function createObjectId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}



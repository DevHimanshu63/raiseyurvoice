const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing chars

export function generateTicketId(): string {
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `RYV-${id}`;
}

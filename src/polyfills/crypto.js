const cryptoBrowserify = require('crypto-browserify');

// Patch randomUUID using the Web Crypto API available in modern browsers
if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
  cryptoBrowserify.randomUUID = () => globalThis.crypto.randomUUID();
} else {
  // Fallback: generate a UUID v4 manually
  cryptoBrowserify.randomUUID = () => {
    const bytes = new Uint8Array(16);
    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
      globalThis.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  };
}

module.exports = cryptoBrowserify;

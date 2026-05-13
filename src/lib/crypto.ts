// src/lib/crypto.ts
// E2EE Messaging Crypto Utilities

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_ALGORITHM = 'RSA-OAEP';

export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return await window.crypto.subtle.generateKey(
    {
      name: KEY_ALGORITHM,
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('spki', key);
  const exportedAsString = String.fromCharCode.apply(null, Array.from(new Uint8Array(exported)));
  return btoa(exportedAsString);
}

export async function exportPrivateKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('pkcs8', key);
  const exportedAsString = String.fromCharCode.apply(null, Array.from(new Uint8Array(exported)));
  return btoa(exportedAsString);
}

export async function importPublicKey(pemString: string): Promise<CryptoKey> {
  const binaryDerString = atob(pemString);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  return await window.crypto.subtle.importKey(
    'spki',
    binaryDer.buffer,
    {
      name: KEY_ALGORITHM,
      hash: 'SHA-256',
    },
    true,
    ['encrypt']
  );
}

export async function importPrivateKey(pemString: string): Promise<CryptoKey> {
  const binaryDerString = atob(pemString);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  return await window.crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    {
      name: KEY_ALGORITHM,
      hash: 'SHA-256',
    },
    true,
    ['decrypt']
  );
}

// AES-GCM
export async function generateMessageKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: ENCRYPTION_ALGORITHM,
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptMessage(
  message: string,
  messageKey: CryptoKey,
  iv: Uint8Array
): Promise<string> {
  const encoded = new TextEncoder().encode(message);
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: iv,
    },
    messageKey,
    encoded
  );
  
  const buffer = new Uint8Array(encrypted);
  let binary = '';
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

export async function decryptMessage(
  encryptedMessageB64: string,
  messageKey: CryptoKey,
  iv: Uint8Array
): Promise<string> {
  const binary = atob(encryptedMessageB64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: iv,
    },
    messageKey,
    buffer
  );
  
  return new TextDecoder().decode(decrypted);
}

// Wrap/Unwrap (or just encrypt/decrypt the exported AES key with RSA)
export async function encryptMessageKey(
  messageKey: CryptoKey,
  publicKey: CryptoKey
): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', messageKey);
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: KEY_ALGORITHM,
    },
    publicKey,
    exported
  );
  
  const buffer = new Uint8Array(encrypted);
  let binary = '';
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

export async function decryptMessageKey(
  encryptedKeyB64: string,
  privateKey: CryptoKey
): Promise<CryptoKey> {
  const binary = atob(encryptedKeyB64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: KEY_ALGORITHM,
    },
    privateKey,
    buffer
  );
  
  return await window.crypto.subtle.importKey(
    'raw',
    decrypted,
    { name: ENCRYPTION_ALGORITHM },
    true,
    ['encrypt', 'decrypt']
  );
}

export function generateIv(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(12));
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

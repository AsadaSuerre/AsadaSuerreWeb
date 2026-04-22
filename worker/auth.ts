// Password hashing and JWT utilities for Cloudflare Workers
// Using Web Crypto API for security

// ==================== PASSWORD HASHING ====================

/**
 * Hash a password using PBKDF2 with SHA-256
 * This is secure and compatible with Cloudflare Workers
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Derive key using PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  const hash = await crypto.subtle.exportKey('raw', key);
  
  // Combine salt and hash for storage
  const combined = new Uint8Array(salt.length + hash.byteLength);
  combined.set(salt, 0);
  combined.set(new Uint8Array(hash), salt.length);
  
  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
}

/**
 * Verify a password against a stored hash
 * Uses timing-safe comparison to prevent timing attacks
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // Decode stored hash
    const combined = new Uint8Array(
      atob(storedHash).split('').map(c => c.charCodeAt(0))
    );
    
    const salt = combined.slice(0, 16);
    const storedHashBytes = combined.slice(16);
    
    // Derive key with the same salt
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    const derivedHash = await crypto.subtle.exportKey('raw', key);
    const derivedHashBytes = derivedHash instanceof ArrayBuffer ? new Uint8Array(derivedHash) : new Uint8Array(0);
    
    // Timing-safe comparison
    if (storedHashBytes.length !== derivedHashBytes.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < storedHashBytes.length; i++) {
      result |= storedHashBytes[i] ^ derivedHashBytes[i];
    }
    
    return result === 0;
  } catch (error) {
    return false;
  }
}

// ==================== JWT UTILITIES ====================

interface JWTPayload {
  sub: string; // subject (user id)
  username: string;
  iat: number; // issued at
  exp: number; // expiration
}

/**
 * Create a JWT token using HMAC-SHA256
 */
export async function createToken(payload: JWTPayload, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  
  // Header
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };
  
  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  
  const data = `${headerEncoded}.${payloadEncoded}`;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  );
  
  const signatureEncoded = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  );
  
  return `${data}.${signatureEncoded}`;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const encoder = new TextEncoder();
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      return null;
    }
    
    const [headerEncoded, payloadEncoded, signatureEncoded] = parts;
    const data = `${headerEncoded}.${payloadEncoded}`;
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signature = Uint8Array.from(atob(signatureEncoded), c => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      encoder.encode(data)
    );
    
    if (!isValid) {
      return null;
    }
    
    const payload: JWTPayload = JSON.parse(base64UrlDecode(payloadEncoded));
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Generate a JWT payload for a user
 */
export function generatePayload(userId: string, username: string): JWTPayload {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (24 * 60 * 60); // 24 hours expiration
  
  return {
    sub: userId,
    username,
    iat: now,
    exp,
  };
}

// ==================== BASE64URL HELPERS ====================

function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}

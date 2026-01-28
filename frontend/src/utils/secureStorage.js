/**
 * MotoFit 2 - Secure Storage Module
 * Encrypts sensitive data before storing in localStorage
 * Uses Web Crypto API for browser-native encryption
 */

// Encryption key derivation (uses a static salt for simplicity)
const SALT = 'MotoFit2SecureStorage2026';
const STORAGE_KEY_PREFIX = 'motofit_secure_';

/**
 * Generate encryption key from passphrase
 * @returns {Promise<CryptoKey>}
 */
async function getEncryptionKey() {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(SALT),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode('motofit-salt'),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt data
 * @param {string} plaintext - Data to encrypt
 * @returns {Promise<string>} - Base64 encoded encrypted data
 */
export async function encrypt(plaintext) {
    try {
        const key = await getEncryptionKey();
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoder.encode(plaintext)
        );

        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);

        // Convert to base64 for storage
        return btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error('Encryption failed:', error);
        return plaintext; // Fallback to plain text
    }
}

/**
 * Decrypt data
 * @param {string} ciphertext - Base64 encoded encrypted data
 * @returns {Promise<string>} - Decrypted plaintext
 */
export async function decrypt(ciphertext) {
    try {
        const key = await getEncryptionKey();

        // Convert from base64
        const combined = new Uint8Array(
            atob(ciphertext).split('').map(c => c.charCodeAt(0))
        );

        // Extract IV and encrypted data
        const iv = combined.slice(0, 12);
        const encrypted = combined.slice(12);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encrypted
        );

        return new TextDecoder().decode(decrypted);
    } catch (error) {
        console.error('Decryption failed:', error);
        return ciphertext; // Return as-is if decryption fails
    }
}

/**
 * Securely save sensitive data
 * @param {string} key - Storage key
 * @param {object} data - Data to store
 * @param {string[]} sensitiveFields - Fields to encrypt
 */
export async function saveSecure(key, data, sensitiveFields = []) {
    try {
        const processedData = { ...data };

        // Encrypt specified sensitive fields
        for (const field of sensitiveFields) {
            if (processedData[field]) {
                processedData[field] = await encrypt(String(processedData[field]));
                processedData[`${field}_encrypted`] = true;
            }
        }

        localStorage.setItem(
            STORAGE_KEY_PREFIX + key,
            JSON.stringify(processedData)
        );
        return true;
    } catch (error) {
        console.error('Secure save failed:', error);
        return false;
    }
}

/**
 * Load and decrypt sensitive data
 * @param {string} key - Storage key
 * @param {string[]} sensitiveFields - Fields to decrypt
 * @returns {Promise<object|null>}
 */
export async function loadSecure(key, sensitiveFields = []) {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_PREFIX + key);
        if (!stored) return null;

        const data = JSON.parse(stored);

        // Decrypt specified sensitive fields
        for (const field of sensitiveFields) {
            if (data[field] && data[`${field}_encrypted`]) {
                data[field] = await decrypt(data[field]);
                delete data[`${field}_encrypted`];
            }
        }

        return data;
    } catch (error) {
        console.error('Secure load failed:', error);
        return null;
    }
}

/**
 * Check if Web Crypto API is available
 * @returns {boolean}
 */
export function isSecureStorageAvailable() {
    return typeof crypto !== 'undefined' &&
        typeof crypto.subtle !== 'undefined' &&
        typeof crypto.subtle.encrypt === 'function';
}

/**
 * Clear all secure storage
 */
export function clearSecureStorage() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
            localStorage.removeItem(key);
        }
    });
}

// Sensitive fields that should be encrypted
export const SENSITIVE_FIELDS = {
    CUSTOMER: ['phone', 'address', 'email'],
    AUTH: ['token', 'password'],
};

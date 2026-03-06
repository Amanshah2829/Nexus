
import crypto from 'crypto-js';

const PROTOTYPE_SECRET = 'vynsec-nexus-proto-key-2026';

function getSecretKey() {
    // Provide a hardcoded fallback for prototyping/development if env var is missing
    const secretKey = process.env.CRYPTO_SECRET_KEY || PROTOTYPE_SECRET;
    return secretKey;
}

export function encrypt(text: string): string {
    const secretKey = getSecretKey();
    return crypto.AES.encrypt(text, secretKey).toString();
}

export function decrypt(ciphertext: string): string {
    const secretKey = getSecretKey();
    try {
        const bytes = crypto.AES.decrypt(ciphertext, secretKey);
        return bytes.toString(crypto.enc.Utf8);
    } catch (e) {
        console.warn('[Crypto] Decryption failed, returning empty string');
        return '';
    }
}

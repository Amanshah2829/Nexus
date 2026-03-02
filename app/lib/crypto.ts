import crypto from 'crypto-js';

function getSecretKey() {
    const secretKey = process.env.CRYPTO_SECRET_KEY;
    if (!secretKey) {
        throw new Error('CRYPTO_SECRET_KEY is not defined in environment variables');
    }
    return secretKey;
}

export function encrypt(text: string): string {
    const secretKey = getSecretKey();
    return crypto.AES.encrypt(text, secretKey).toString();
}

export function decrypt(ciphertext: string): string {
    const secretKey = getSecretKey();
    const bytes = crypto.AES.decrypt(ciphertext, secretKey);
    return bytes.toString(crypto.enc.Utf8);
}

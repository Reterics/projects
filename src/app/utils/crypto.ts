export interface EncryptedData {
    encrypted: string;
    iv: string;
    salt: string;
}

async function deriveKeyPBKDF2Browser(passphrase: string, salt: Uint8Array<ArrayBuffer>) {
    const encoder = new TextEncoder();
    const passphraseKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    // Derive a 256-bit AES-GCM key
    return await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,         // ArrayBuffer of random salt
            iterations: 100000, // Increase if performance allows
            hash: "SHA-256"
        },
        passphraseKey,
        {name: "AES-GCM", length: 256},
        false,
        ["encrypt", "decrypt"]
    );
}

export async function encryptData(plainText: string, passphrase?: string): Promise<EncryptedData> {
    passphrase = passphrase ?? process.env.NEXT_PUBLIC_PASSPHRASE ?? 'passphrase';

    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const key = await deriveKeyPBKDF2Browser(passphrase, salt);

    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encoder.encode(plainText)
    );

    return {
        encrypted: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
        iv: btoa(String.fromCharCode(...iv)),
        salt: btoa(String.fromCharCode(...salt))
    };
}

export async function decryptData(encryptedData: EncryptedData, passphrase?: string): Promise<string>{
    passphrase = passphrase ?? process.env.NEXT_PUBLIC_PASSPHRASE ?? 'passphrase';
    const decoder = new TextDecoder();

    const encryptedBuffer = Uint8Array.from(atob(encryptedData.encrypted), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0));
    const salt = Uint8Array.from(atob(encryptedData.salt), c => c.charCodeAt(0));

    const key = await deriveKeyPBKDF2Browser(passphrase, salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encryptedBuffer
    );

    return decoder.decode(decryptedBuffer);
}

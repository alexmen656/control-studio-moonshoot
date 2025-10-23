import { encrypt, decrypt } from './crypto_functions.js';
import db from './db.js';

export async function storeToken(userId, serviceName, tokenObject) {
    const tokenString = JSON.stringify(tokenObject);
    const encrypted = encrypt(tokenString);

    const query = `
    INSERT INTO user_api_tokens (user_id, service_name, token_content, token_iv, token_tag, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, service_name)
    DO UPDATE SET token_content = $3, token_iv = $4, token_tag = $5, updated_at = CURRENT_TIMESTAMP
    `;

    const values = [
        userId,
        serviceName,
        encrypted.content,
        encrypted.iv,
        encrypted.tag
    ];

    await db.query(query, values);
}

export async function retrieveToken(userId, serviceName) {
    const query = `
    SELECT token_content, token_iv, token_tag
    FROM user_api_tokens
    WHERE user_id = $1 AND service_name = $2
    `;

    const values = [userId, serviceName];
    const res = await db.query(query, values);
    //console.log('Database response:', res);
    if (res.rows.length === 0) {
        return null;
    }

    const row = res.rows[0];
    console.log('Retrieved row:', row);
    const encrypted = {
        content: row.token_content,
        iv: row.token_iv,
        tag: row.token_tag
    };

    console.log('Encrypted token data:', encrypted);

    const decryptedString = decrypt(encrypted);//decrypt(encrypted);
    console.log('Decrypted token string:', decryptedString);
    return JSON.parse(decryptedString)//JSON.parse(decryptedString);
}

export async function deleteToken(userId, serviceName) {
    const query = `
    DELETE FROM user_api_tokens
    WHERE user_id = $1 AND service_name = $2
    `;
    const values = [userId, serviceName];
    await db.query(query, values);
}
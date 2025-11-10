import { encrypt, decrypt } from './crypto_functions.js';
import db from './db.js';

export async function storeTokenByProjectID(serviceName, tokenObject, projectId) {//userId, 
    const userId = 1;
    const tokenString = JSON.stringify(tokenObject);
    const encrypted = encrypt(tokenString);

    const query = `
    INSERT INTO user_api_tokens (user_id, service_name, token_content, token_iv, token_tag, created_at, updated_at, project_id)
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $6)
    ON CONFLICT (user_id, service_name, project_id)
    DO UPDATE SET token_content = $3, token_iv = $4, token_tag = $5, updated_at = CURRENT_TIMESTAMP
    `;

    const values = [
        userId,
        serviceName,
        encrypted.content,
        encrypted.iv,
        encrypted.tag,
        projectId
    ];

    await db.query(query, values);
}

export async function retrieveTokenByProjectID(serviceName, projectId) {//userId, 
    const userId = 1;
    const query = `
    SELECT token_content, token_iv, token_tag
    FROM user_api_tokens
    WHERE user_id = $1 AND service_name = $2 AND project_id = $3
    `;

    const values = [userId, serviceName, projectId];
    const res = await db.query(query, values);

    if (res.rows.length === 0) {
        return null;
    }

    const row = res.rows[0];
    const encrypted = {
        content: row.token_content,
        iv: row.token_iv,
        tag: row.token_tag
    };

    const decryptedString = decrypt(encrypted);
    return JSON.parse(decryptedString)
}

export async function removeTokenByProjectID(serviceName, projectId) {
    const userId = 1;
    const query = `
    DELETE FROM user_api_tokens
    WHERE user_id = $1 AND service_name = $2 AND project_id = $3
    `;
    const values = [userId, serviceName, projectId];
    await db.query(query, values);
}
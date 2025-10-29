import db from './db.js';

export async function storeOAuthState(platform, projectId, stateToken) {
    const query = `
    INSERT INTO oauth_states (platform, project_id, state_token, created_at, expires_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '15 minutes')
    ON CONFLICT (state_token)
    DO UPDATE SET created_at = CURRENT_TIMESTAMP, expires_at = CURRENT_TIMESTAMP + INTERVAL '15 minutes'
    `;

    const values = [platform, projectId, stateToken];
    await db.query(query, values);
}

export async function retrieveOAuthState(stateToken) {
    console.log('Retrieving OAuth state for token:', stateToken);
    const query = `
    SELECT platform, project_id, state_token, created_at, expires_at
    FROM oauth_states
    WHERE state_token = $1 AND expires_at > CURRENT_TIMESTAMP
    `;

    const values = [stateToken];
    const res = await db.query(query, values);
    //console.log('OAuth state retrieval result:', res);
    //return res.rows[0];
    //return res.fields[0];

    console.log('OAuth state retrieval rows:', res.rows[0]);
    return res.rows[0];
}
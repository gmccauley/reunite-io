import { jwtVerify, createRemoteJWKSet } from 'jose';

async function verifyToken(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const token = authHeader.substring(7);

    if (!env.AUTH0_DOMAIN || !env.AUTH0_AUDIENCE) {
        console.error("Server configuration error: Missing AUTH0_DOMAIN or AUTH0_AUDIENCE in environment secrets.");
        return new Response(JSON.stringify({ error: 'Server configuration error.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const JWKS = createRemoteJWKSet(new URL(`https://${env.AUTH0_DOMAIN}/.well-known/jwks.json`));
        await jwtVerify(token, JWKS, {
            issuer: `https://${env.AUTH0_DOMAIN}/`,
            audience: env.AUTH0_AUDIENCE,
        });
    } catch (err) {
        console.error("Token verification failed:", err.message);
        return new Response(JSON.stringify({ error: `Token is invalid. Reason: ${err.code || err.message}` }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;

    const verificationResponse = await verifyToken(request, env);
    if (verificationResponse) {
        return verificationResponse;
    }

    try {
        const watch = await request.json();
        const { serial_number, model, status, latitude, longitude, date_reported, email } = watch;

        if (!serial_number || !model || !status || !latitude || !longitude || !date_reported || !email) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // --- Core Matching Logic ---
        const oppositeStatus = status === 'lost' ? 'found' : 'lost';
        const match = await env.DB.prepare(
            'SELECT * FROM watches WHERE serial_number = ? AND status = ?'
        ).bind(serial_number, oppositeStatus).first();

        // Insert the new report into the database
        await env.DB.prepare(
            'INSERT INTO watches (serial_number, model, status, latitude, longitude, date_reported, email) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(serial_number, model, status, latitude, longitude, date_reported, email).run();

        if (match) {
            // A match was found, but we will NOT change the status automatically.
            // We will simply notify the user. The logic to confirm a reunion will be handled later.
            
            // In a real app, you would trigger an email notification here to connect match.email and email.
            const message = `It's a Match! We have a record of this watch being ${oppositeStatus}. We will notify the other party to help arrange a reunion.`;
            return new Response(JSON.stringify({ success: true, match: true, message: message }), {
                headers: { 'Content-Type': 'application/json' },
                status: 200 
            });

        } else {
            // No match found, just a standard submission
            return new Response(JSON.stringify({ success: true, match: false, message: 'Your report has been submitted successfully.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 201
            });
        }

    } catch (e) {
        console.error("Error in POST /api/watches:", e.message);
        return new Response(JSON.stringify({ error: 'Database error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}


export async function onRequestGet(context) {
     const { env } = context;
    try {
        const { results } = await env.DB.prepare(
            "SELECT latitude, longitude, status, model, date_reported FROM watches WHERE status IN ('lost', 'found')"
        ).all();

        return new Response(JSON.stringify(results), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (e) {
        console.error("Error in GET /api/watches:", e.message);
        return new Response('Error fetching watches', { status: 500 });
    }
}


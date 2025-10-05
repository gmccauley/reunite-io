/**
 * Welcome to the Lost & Found Apple Watch API!
 * This Cloudflare Worker handles two main things:
 * 1. POST /api/found: Takes details of a found watch and saves it to a D1 database.
 * 2. POST /api/lost: Takes the serial number of a lost watch and checks the database for a match.
 *
 * The `env` parameter contains bindings defined in your `wrangler.toml` or Cloudflare dashboard,
 * specifically the binding to our D1 database, which we access via `env.DB`.
 */

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const path = url.pathname.replace('/api', ''); // remove /api prefix if pages is proxying

		// Simple routing based on path and method
		if (path === '/found' && request.method === 'POST') {
			return handleFoundRequest(request, env);
		}

		if (path === '/lost' && request.method === 'POST') {
			return handleLostRequest(request, env);
		}

		return new Response('Not Found', { status: 404 });
	},
};

async function handleFoundRequest(request, env) {
	try {
		const data = await request.json();

		// Basic validation
		if (!data.serial_number || !data.finder_email) {
			return new Response(JSON.stringify({ error: 'Serial Number and Finder Email are required.' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const { serial_number, model, location_found, description, finder_email } = data;
		
		// Use the D1 binding to prepare and execute a SQL statement.
		// Using parameterized queries (`?`) is crucial to prevent SQL injection.
		const ps = env.DB.prepare(
			'INSERT INTO found_watches (serial_number, model, location_found, description, finder_email) VALUES (?, ?, ?, ?, ?)'
		);
		const { success } = await ps.bind(serial_number, model || '', location_found || '', description || '', finder_email).run();

		if (success) {
			return new Response(JSON.stringify({ message: 'Watch report submitted successfully.' }), {
				status: 201,
				headers: { 'Content-Type': 'application/json' },
			});
		} else {
			return new Response(JSON.stringify({ error: 'Database error: Failed to insert record.' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	} catch (e) {
		return new Response(JSON.stringify({ error: 'Server error: ' + e.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}

async function handleLostRequest(request, env) {
	try {
		const data = await request.json();

		if (!data.serial_number) {
			return new Response(JSON.stringify({ error: 'Serial Number is required.' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}
		
		const { serial_number } = data;

		// Prepare a query to find a watch by its serial number.
		const ps = env.DB.prepare('SELECT * FROM found_watches WHERE serial_number = ?').bind(serial_number);
		const result = await ps.first();

		if (result) {
			// A match was found!
			return new Response(JSON.stringify({ match: true, data: result }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} else {
			// No match found in the database.
			return new Response(JSON.stringify({ match: false, message: 'No matching watch found.' }), {
				status: 200, // Still a successful request, just no result
				headers: { 'Content-Type': 'application/json' },
			});
		}
	} catch (e) {
		return new Response(JSON.stringify({ error: 'Server error: ' + e.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}


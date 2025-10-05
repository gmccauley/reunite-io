/**
 * Handles GET requests to /api/watches to fetch all watch locations for the map.
 * This endpoint intentionally excludes the serial number for privacy.
 * @param {object} context - The context object.
 * @param {object} context.env - The environment object with bindings.
 * @returns {Response}
 */
export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT status, latitude, longitude, date_reported, model FROM watches WHERE status IN ('lost', 'found')"
    ).all();
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching watches:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch watches" }), { status: 500 });
  }
}

/**
 * Handles POST requests to /api/watches to add a new watch report.
 * @param {object} context - The context object.
 * @param {Request} context.request - The incoming request.
 * @param {object} context.env - The environment object with bindings.
 * @returns {Response}
 */
export async function onRequestPost({ request, env }) {
  try {
    const newWatch = await request.json();

    // Basic validation
    if (!newWatch.serial_number || !newWatch.status || !newWatch.email || !newWatch.date_reported) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // Check for a match
    const oppositeStatus = newWatch.status === 'lost' ? 'found' : 'lost';
    const stmt = env.DB.prepare("SELECT * FROM watches WHERE serial_number = ? AND status = ? LIMIT 1");
    const matchingWatch = await stmt.bind(newWatch.serial_number, oppositeStatus).first();

    if (matchingWatch) {
      // Match Found! Update both records to 'reunited'.
      const updateStmt = env.DB.prepare("UPDATE watches SET status = 'reunited', reunited_with = ? WHERE serial_number = ?");
      await env.DB.batch([
          updateStmt.bind(matchingWatch.email, newWatch.serial_number),
          updateStmt.bind(newWatch.email, newWatch.serial_number)
      ]);

      // In a real app, you would trigger an email notification here.
      const matchResult = {
          match: true,
          message: `Success! We found a match. The other party (${matchingWatch.email}) has been notified.`,
          finder_email: newWatch.status === 'found' ? newWatch.email : matchingWatch.email,
          loser_email: newWatch.status === 'lost' ? newWatch.email : matchingWatch.email
      };
       return new Response(JSON.stringify(matchResult), { headers: { "Content-Type": "application/json" } });

    } else {
      // No match, just insert the new record.
      const insertStmt = env.DB.prepare(
        "INSERT INTO watches (serial_number, status, email, latitude, longitude, date_reported, model) VALUES (?, ?, ?, ?, ?, ?, ?)"
      );
      await insertStmt.bind(
        newWatch.serial_number,
        newWatch.status,
        newWatch.email,
        newWatch.latitude,
        newWatch.longitude,
        newWatch.date_reported,
        newWatch.model
      ).run();

      return new Response(JSON.stringify({ match: false, message: "Report submitted. We will notify you if we find a match." }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error in POST /api/watches:", error);
    return new Response(JSON.stringify({ error: "Failed to process request", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


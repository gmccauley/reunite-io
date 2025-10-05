/**
 * Handles GET requests to /api/stats
 * @param {object} context - The context object.
 * @param {object} context.env - The environment object with bindings.
 * @returns {Response}
 */
export async function onRequestGet({ env }) {
    try {
      const db = env.DB;
  
      // Concurrently execute all count queries for better performance
      const [lostResult, foundResult, reunitedResult] = await Promise.all([
        db.prepare("SELECT COUNT(*) as count FROM watches WHERE status = 'lost'").first(),
        db.prepare("SELECT COUNT(*) as count FROM watches WHERE status = 'found'").first(),
        db.prepare("SELECT COUNT(*) as count FROM watches WHERE status = 'reunited'").first(),
      ]);
  
      const stats = {
        lost: lostResult?.count ?? 0,
        found: foundResult?.count ?? 0,
        reunited: reunitedResult?.count ?? 0,
      };
  
      return new Response(JSON.stringify(stats), {
        headers: { "Content-Type": "application/json" },
      });
  
    } catch (error) {
      console.error("Error fetching stats:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch stats", details: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  
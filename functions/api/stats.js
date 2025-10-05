export async function onRequestGet({ env }) {
  try {
      const lostStmt = env.DB.prepare("SELECT COUNT(*) as count FROM watches WHERE status = 'lost'");
      const foundStmt = env.DB.prepare("SELECT COUNT(*) as count FROM watches WHERE status = 'found'");
      const reunitedStmt = env.DB.prepare("SELECT COUNT(*) as count FROM watches WHERE status = 'reunited'");

      const [lost, found, reunited] = await Promise.all([
          lostStmt.first(),
          foundStmt.first(),
          reunitedStmt.first()
      ]);

      // The reunited count should be per pair, so we divide by 2
      const reunitedCount = Math.floor(reunited.count / 2);

      const stats = {
          lost: lost.count,
          found: found.count,
          reunited: reunitedCount
      };

      return new Response(JSON.stringify(stats), {
          headers: { 'Content-Type': 'application/json' }
      });

  } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
      });
  }
}


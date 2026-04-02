import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { cities } = await req.json();
    if (!cities || !cities.length) return Response.json({ alerts: [] });

    const cityList = cities.slice(0, 5).join(', ');

    const result = await base44.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      add_context_from_internet: true,
      prompt: `Search for current real-time disruptions affecting these cruise ports: ${cityList}.

Look for:
- Port closures or restricted access
- Transit/transport strikes (buses, trains, taxis)
- Severe weather warnings or storms
- Security alerts or protests
- Major delays or operational issues

Today's date: ${new Date().toISOString().split('T')[0]}

For each disruption found, provide accurate current information. If nothing significant is found for a city, do not include it.
Only include genuinely current/active issues, not historical ones.`,
      response_json_schema: {
        type: "object",
        properties: {
          alerts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                city: { type: "string" },
                alert_type: { type: "string", enum: ["strike", "closure", "weather", "delay", "security", "other"] },
                severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                title: { type: "string" },
                description: { type: "string" },
                source: { type: "string" }
              }
            }
          }
        }
      }
    });

    const alerts = result?.alerts || [];

    // Save alerts to DB (clear old ones for these cities first)
    for (const city of cities) {
      const existing = await base44.asServiceRole.entities.PortAlert.filter({ city, active: true });
      for (const old of existing) {
        await base44.asServiceRole.entities.PortAlert.update(old.id, { active: false });
      }
    }

    for (const alert of alerts) {
      await base44.asServiceRole.entities.PortAlert.create({
        ...alert,
        active: true,
        expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6h TTL
      });
    }

    return Response.json({ alerts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
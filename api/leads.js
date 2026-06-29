const { clean, deleteLead, listLeads, updateLead } = require("./_crm");

function getBearerToken(req) {
  const header = clean(req.headers.authorization, 500);
  if (header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }

  return clean(req.query?.token, 500);
}

function supabaseMessage(error) {
  const status = error.status ? `Supabase-feil ${error.status}` : "Supabase-feil";
  const details = clean(error.details, 500);

  if (error.status === 401 || error.status === 403) {
    return `${status}: nøkkelen mangler tilgang. Sjekk at SERVICE_ROLE_KEY er service_role key, ikke anon/public key.`;
  }

  if (error.status === 404) {
    return `${status}: fant ikke leads-tabellen. Kjør database/supabase-schema.sql i SQL Editor.`;
  }

  if (details) {
    return `${status}: ${details}`;
  }

  return `${status}: ukjent svar fra Supabase.`;
}

module.exports = async function handler(req, res) {
  if (!["GET", "PATCH", "DELETE"].includes(req.method)) {
    res.setHeader("Allow", "GET, PATCH, DELETE");
    return res.status(405).json({ message: "Kun GET, PATCH og DELETE er tillatt." });
  }

  const adminToken = clean(process.env.ADMIN_TOKEN, 500);
  if (!adminToken) {
    return res.status(503).json({ message: "Adminpanel mangler ADMIN_TOKEN i Vercel." });
  }

  if (getBearerToken(req) !== adminToken) {
    return res.status(401).json({ message: "Ugyldig admin-token." });
  }

  try {
    if (req.method === "PATCH") {
      const body = req.body || {};
      const id = clean(body.id, 80);
      const action = clean(body.action, 40);
      const now = new Date().toISOString();
      const actions = {
        contacted: { status: "contacted", last_contacted_at: now },
        customer: { status: "customer", is_customer: true, last_contacted_at: now },
        archived: { status: "archived" }
      };

      if (!id || !actions[action]) {
        return res.status(400).json({ message: "Mangler gyldig kunde eller handling." });
      }

      const result = await updateLead(id, actions[action]);

      if (!result.configured) {
        return res.status(503).json({ message: "Database mangler Supabase-oppsett i Vercel." });
      }

      return res.status(200).json({ lead: result.lead });
    }

    if (req.method === "DELETE") {
      const id = clean(req.query?.id || req.body?.id, 80);

      if (!id) {
        return res.status(400).json({ message: "Mangler kunde som skal slettes." });
      }

      const result = await deleteLead(id);

      if (!result.configured) {
        return res.status(503).json({ message: "Database mangler Supabase-oppsett i Vercel." });
      }

      return res.status(200).json({ ok: true });
    }

    const result = await listLeads({
      q: clean(req.query?.q, 120),
      status: clean(req.query?.status, 40),
      limit: Number(req.query?.limit || 50)
    });

    if (!result.configured) {
      return res.status(503).json({ message: "Database mangler Supabase-oppsett i Vercel." });
    }

    return res.status(200).json({ leads: result.leads });
  } catch (error) {
    console.error("Lead search failed", error);
    if (error.name === "AbortError") {
      return res.status(504).json({ message: "Databasen brukte for lang tid på å svare. Sjekk Supabase URL og service role key." });
    }

    if (error.name === "SupabaseError") {
      return res.status(502).json({ message: supabaseMessage(error) });
    }

    if (error.name === "SupabaseConfigError") {
      return res.status(503).json({ message: error.details });
    }

    const details = clean(error.message, 500);
    return res.status(500).json({
      message: details
        ? `Kunne ikke hente leads akkurat na: ${details}`
        : "Kunne ikke hente leads akkurat na. Sjekk Vercel Logs for Supabase-feilen."
    });
  }
};

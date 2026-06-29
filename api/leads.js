const { clean, listLeads } = require("./_crm");

function getBearerToken(req) {
  const header = clean(req.headers.authorization, 500);
  if (header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }

  return clean(req.query?.token, 500);
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Kun GET er tillatt." });
  }

  const adminToken = clean(process.env.ADMIN_TOKEN, 500);
  if (!adminToken) {
    return res.status(503).json({ message: "Adminpanel mangler ADMIN_TOKEN i Vercel." });
  }

  if (getBearerToken(req) !== adminToken) {
    return res.status(401).json({ message: "Ugyldig admin-token." });
  }

  try {
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

    const details = error.message || "";
    if (details.includes("Supabase select failed: 401") || details.includes("Supabase select failed: 403")) {
      return res.status(502).json({ message: "Supabase nekter tilgang. Sjekk at SERVICE_ROLE_KEY er service_role key, ikke anon/public key." });
    }

    if (details.includes("Supabase select failed: 404")) {
      return res.status(502).json({ message: "Fant ikke leads-tabellen i Supabase. Kjør database/supabase-schema.sql i SQL Editor." });
    }

    if (details.includes("Supabase select failed: 400")) {
      return res.status(502).json({ message: "Supabase-spørringen feilet. Sjekk at leads-tabellen har riktig kolonner." });
    }

    return res.status(500).json({ message: "Kunne ikke hente leads akkurat na. Sjekk Vercel Logs for Supabase-feilen." });
  }
};

function clean(value, maxLength = 2000) {
  return String(value || "").trim().slice(0, maxLength);
}

function getSupabaseConfig() {
  const url = clean(process.env.SUPABASE_URL, 500).replace(/\/$/, "");
  const key = clean(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY,
    2000
  );

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

function supabaseHeaders(config, extra = {}) {
  return {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    ...extra
  };
}

function supabaseError(operation, response, details) {
  const error = new Error(`Supabase ${operation} failed`);
  error.name = "SupabaseError";
  error.operation = operation;
  error.status = response.status;
  error.details = clean(details, 700);
  return error;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function insertLead(lead) {
  const config = getSupabaseConfig();

  if (!config) {
    return { ok: false, configured: false };
  }

  const response = await fetchWithTimeout(
    `${config.url}/rest/v1/leads`,
    {
      method: "POST",
      headers: supabaseHeaders(config, {
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      }),
      body: JSON.stringify(lead)
    },
    5000
  );

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw supabaseError("insert", response, details);
  }

  return { ok: true, configured: true };
}

async function listLeads({ q = "", status = "", limit = 50 } = {}) {
  const config = getSupabaseConfig();

  if (!config) {
    return { ok: false, configured: false, leads: [] };
  }

  const params = new URLSearchParams();
  params.set("select", "id,created_at,source,status,name,email,phone,company,service,message,notes,is_customer,last_contacted_at");
  params.set("order", "created_at.desc");
  params.set("limit", String(Math.min(Math.max(Number(limit) || 50, 1), 100)));

  const query = clean(q, 120);
  if (query) {
    const escaped = query.replaceAll("*", "").replaceAll(",", " ");
    const pattern = `*${escaped}*`;
    params.set("or", `(name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern},company.ilike.${pattern},service.ilike.${pattern},message.ilike.${pattern},notes.ilike.${pattern})`);
  }

  const cleanStatus = clean(status, 40);
  if (cleanStatus) {
    params.set("status", `eq.${cleanStatus}`);
  }

  const response = await fetchWithTimeout(`${config.url}/rest/v1/leads?${params}`, {
    headers: supabaseHeaders(config)
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw supabaseError("select", response, details);
  }

  return {
    ok: true,
    configured: true,
    leads: await response.json()
  };
}

module.exports = {
  clean,
  insertLead,
  listLeads
};

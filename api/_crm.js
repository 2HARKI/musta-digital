function clean(value, maxLength = 2000) {
  return String(value || "").trim().slice(0, maxLength);
}

function getSupabaseConfig() {
  const rawUrl = clean(process.env.SUPABASE_URL, 500).replace(/\/$/, "");
  const key = clean(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY,
    2000
  );

  if (!rawUrl || !key) {
    return null;
  }

  const url = normalizeSupabaseUrl(rawUrl);

  return { url, key, keyRole: getKeyRole(key) };
}

function normalizeSupabaseUrl(url) {
  if (url.startsWith("sb_") || url.startsWith("eyJ")) {
    throw supabaseConfigError("SUPABASE_URL er satt til en key. Bruk Supabase Project URL, for eksempel https://prosjektref.supabase.co.");
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !parsed.hostname) {
      throw new Error("Invalid Supabase URL");
    }

    if (parsed.pathname === "/rest/v1") {
      parsed.pathname = "";
      return parsed.toString().replace(/\/$/, "");
    }

    if (parsed.pathname && parsed.pathname !== "/") {
      throw new Error("Invalid Supabase URL path");
    }

    return parsed.toString().replace(/\/$/, "");
  } catch (error) {
    throw supabaseConfigError("SUPABASE_URL er ikke en gyldig Supabase URL. Bruk https://prosjektref.supabase.co, ikke API URL med /rest/v1/.");
  }
}

function getKeyRole(key) {
  const parts = key.split(".");
  if (parts.length < 2) {
    return "";
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return clean(payload.role, 80);
  } catch (error) {
    return "";
  }
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

function supabaseConfigError(message) {
  const error = new Error(message);
  error.name = "SupabaseConfigError";
  error.details = message;
  return error;
}

function assertServerKey(config) {
  if (config.keyRole && config.keyRole !== "service_role") {
    throw supabaseConfigError(`SERVICE_ROLE_KEY ser ut som en ${config.keyRole}-key. Bruk service_role secret key fra Supabase.`);
  }
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

  assertServerKey(config);

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

  assertServerKey(config);

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

async function updateLead(id, updates) {
  const config = getSupabaseConfig();

  if (!config) {
    return { ok: false, configured: false, lead: null };
  }

  assertServerKey(config);

  const safeId = clean(id, 80);
  const response = await fetchWithTimeout(
    `${config.url}/rest/v1/leads?id=eq.${encodeURIComponent(safeId)}`,
    {
      method: "PATCH",
      headers: supabaseHeaders(config, {
        "Content-Type": "application/json",
        Prefer: "return=representation"
      }),
      body: JSON.stringify(updates)
    }
  );

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw supabaseError("update", response, details);
  }

  const rows = await response.json().catch(() => []);
  return {
    ok: true,
    configured: true,
    lead: rows[0] || null
  };
}

async function deleteLead(id) {
  const config = getSupabaseConfig();

  if (!config) {
    return { ok: false, configured: false };
  }

  assertServerKey(config);

  const safeId = clean(id, 80);
  const response = await fetchWithTimeout(
    `${config.url}/rest/v1/leads?id=eq.${encodeURIComponent(safeId)}`,
    {
      method: "DELETE",
      headers: supabaseHeaders(config)
    }
  );

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw supabaseError("delete", response, details);
  }

  return { ok: true, configured: true };
}

module.exports = {
  clean,
  deleteLead,
  insertLead,
  listLeads,
  updateLead
};

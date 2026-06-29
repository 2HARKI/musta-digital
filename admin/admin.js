const loginScreen = document.querySelector("[data-login-screen]");
const dashboard = document.querySelector("[data-dashboard]");
const loginForm = document.querySelector("[data-login-form]");
const loginStatus = document.querySelector("[data-login-status]");
const searchForm = document.querySelector("[data-search-form]");
const logoutButton = document.querySelector("[data-logout-button]");
const statusText = document.querySelector("[data-leads-status]");
const results = document.querySelector("[data-leads-results]");
const totalCount = document.querySelector("[data-total-count]");
const newCount = document.querySelector("[data-new-count]");
const customerCount = document.querySelector("[data-customer-count]");

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("no-NO", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function customerCard(lead) {
  const id = escapeHtml(lead.id || "");
  const status = lead.status || "new";
  const isCustomer = lead.is_customer || status === "customer";
  const isArchived = status === "archived";

  return `
    <article class="customer-card" data-lead-id="${id}">
      <div class="customer-card-head">
        <div>
          <h2>${escapeHtml(lead.company || lead.name || "Ukjent kunde")}</h2>
          <p>${escapeHtml(lead.name || "-")} · ${escapeHtml(lead.email || "-")}</p>
        </div>
        <span>${escapeHtml(statusLabel(lead))}</span>
      </div>
      <dl>
        <div><dt>Dato</dt><dd>${formatDate(lead.created_at)}</dd></div>
        <div><dt>Telefon</dt><dd>${escapeHtml(lead.phone || "-")}</dd></div>
        <div><dt>Tjeneste</dt><dd>${escapeHtml(lead.service || "-")}</dd></div>
        <div><dt>Kilde</dt><dd>${escapeHtml(lead.source || "-")}</dd></div>
      </dl>
      <p>${escapeHtml(lead.message || "Ingen melding.")}</p>
      ${lead.notes ? `<p class="customer-note">${escapeHtml(lead.notes)}</p>` : ""}
      <div class="customer-actions" aria-label="Handlinger for ${escapeHtml(lead.company || lead.name || "kunde")}">
        <button type="button" data-lead-id="${id}" data-lead-action="contacted" ${status === "contacted" || isCustomer || isArchived ? "disabled" : ""}>Kontaktet</button>
        <button type="button" data-lead-id="${id}" data-lead-action="customer" ${isCustomer || isArchived ? "disabled" : ""}>Kunde</button>
        <button type="button" data-lead-id="${id}" data-lead-action="archived" ${isArchived ? "disabled" : ""}>Arkiver</button>
        <button class="danger" type="button" data-lead-id="${id}" data-lead-delete="${escapeHtml(lead.company || lead.name || "kunden")}">Slett</button>
      </div>
    </article>
  `;
}

function getToken() {
  return sessionStorage.getItem("mustaAdminToken") || "";
}

function setLoggedIn(isLoggedIn) {
  if (!loginScreen || !dashboard) return;
  loginScreen.hidden = isLoggedIn;
  dashboard.hidden = !isLoggedIn;
}

function statusLabel(lead) {
  if (lead.status === "archived") return "Arkivert";
  if (lead.is_customer) return "Kunde";
  if (lead.status === "customer") return "Kunde";
  if (lead.status === "contacted") return "Kontaktet";
  if (lead.status === "closed") return "Avsluttet";
  return "Ny";
}

function updateStats(leads) {
  if (totalCount) totalCount.textContent = String(leads.length);
  if (newCount) newCount.textContent = String(leads.filter((lead) => (lead.status || "new") === "new").length);
  if (customerCount) customerCount.textContent = String(leads.filter((lead) => lead.is_customer || lead.status === "customer").length);
}

function logout() {
  sessionStorage.removeItem("mustaAdminToken");
  if (loginForm) loginForm.reset();
  if (searchForm) searchForm.reset();
  if (loginStatus) loginStatus.textContent = "";
  if (statusText) statusText.textContent = "";
  if (results) results.innerHTML = "";
  updateStats([]);
  setLoggedIn(false);
}

async function fetchJson(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    const body = await response.json().catch(() => ({}));
    return { response, body };
  } finally {
    window.clearTimeout(timeout);
  }
}

async function login(event) {
  event.preventDefault();

  const data = new FormData(loginForm);
  const token = String(data.get("token") || "").trim();

  if (!token) {
    loginStatus.textContent = "Skriv inn passord først.";
    return;
  }

  loginStatus.textContent = "Logger inn...";

  try {
    const { response, body } = await fetchJson("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });

    if (!response.ok) {
      throw new Error(body.message || "Kunne ikke logge inn.");
    }

    sessionStorage.setItem("mustaAdminToken", token);
    loginStatus.textContent = "";
    setLoggedIn(true);
    loadCustomers();
  } catch (error) {
    loginStatus.textContent = error.name === "AbortError"
      ? "Innloggingen tok for lang tid. Prøv igjen."
      : error.message;
  }
}

async function loadCustomers(event) {
  if (event) event.preventDefault();

  const token = getToken();
  const q = searchForm ? String(new FormData(searchForm).get("q") || "").trim() : "";

  if (!token) {
    setLoggedIn(false);
    return;
  }

  statusText.textContent = "Henter kunder...";
  results.innerHTML = "";

  try {
    const { response, body } = await fetchJson(`/api/leads?q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 401) {
      sessionStorage.removeItem("mustaAdminToken");
      setLoggedIn(false);
      throw new Error("Du må logge inn på nytt.");
    }

    if (!response.ok) {
      throw new Error(body.message || "Kunne ikke hente kunder.");
    }

    const leads = body.leads || [];
    updateStats(leads);
    statusText.textContent = leads.length
      ? `Viser ${leads.length} kunde${leads.length === 1 ? "" : "r"}/henvendelse${leads.length === 1 ? "" : "r"}.`
      : "Ingen treff.";
    results.innerHTML = leads.map(customerCard).join("");
  } catch (error) {
    statusText.textContent = error.name === "AbortError"
      ? "Kundelisten brukte for lang tid. Sjekk Supabase-oppsettet i Vercel."
      : error.message;
  }
}

async function updateLeadStatus(event) {
  const button = event.target.closest("[data-lead-action]");
  if (!button) return;

  const token = getToken();
  const id = button.dataset.leadId || "";
  const action = button.dataset.leadAction || "";

  if (!token) {
    logout();
    return;
  }

  button.disabled = true;
  statusText.textContent = "Oppdaterer kunde...";

  try {
    const { response, body } = await fetchJson("/api/leads", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id, action })
    });

    if (response.status === 401) {
      logout();
      throw new Error("Du må logge inn på nytt.");
    }

    if (!response.ok) {
      throw new Error(body.message || "Kunne ikke oppdatere kunden.");
    }

    await loadCustomers();
  } catch (error) {
    statusText.textContent = error.name === "AbortError"
      ? "Oppdateringen tok for lang tid. Prøv igjen."
      : error.message;
    button.disabled = false;
  }
}

async function deleteCustomer(event) {
  const button = event.target.closest("[data-lead-delete]");
  if (!button) return;

  const token = getToken();
  const id = button.dataset.leadId || "";
  const name = button.dataset.leadDelete || "kunden";

  if (!token) {
    logout();
    return;
  }

  if (!window.confirm(`Slette ${name} permanent fra kundelisten?`)) {
    return;
  }

  button.disabled = true;
  statusText.textContent = "Sletter kunde...";

  try {
    const { response, body } = await fetchJson(`/api/leads?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 401) {
      logout();
      throw new Error("Du må logge inn på nytt.");
    }

    if (!response.ok) {
      throw new Error(body.message || "Kunne ikke slette kunden.");
    }

    await loadCustomers();
  } catch (error) {
    statusText.textContent = error.name === "AbortError"
      ? "Slettingen tok for lang tid. Prøv igjen."
      : error.message;
    button.disabled = false;
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", login);
}

if (searchForm) {
  searchForm.addEventListener("submit", loadCustomers);
}

if (logoutButton) {
  logoutButton.addEventListener("click", logout);
}

if (results) {
  results.addEventListener("click", updateLeadStatus);
  results.addEventListener("click", deleteCustomer);
}

if (getToken()) {
  setLoggedIn(true);
  loadCustomers();
} else {
  setLoggedIn(false);
}

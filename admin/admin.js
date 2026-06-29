const form = document.querySelector("[data-leads-form]");
const statusText = document.querySelector("[data-leads-status]");
const results = document.querySelector("[data-leads-results]");

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

function leadCard(lead) {
  return `
    <article class="lead-card">
      <div class="lead-card-head">
        <div>
          <h2>${escapeHtml(lead.company || lead.name || "Ukjent lead")}</h2>
          <p>${escapeHtml(lead.name || "-")} · ${escapeHtml(lead.email || "-")}</p>
        </div>
        <span>${escapeHtml(lead.status || "new")}</span>
      </div>
      <dl>
        <div><dt>Dato</dt><dd>${formatDate(lead.created_at)}</dd></div>
        <div><dt>Telefon</dt><dd>${escapeHtml(lead.phone || "-")}</dd></div>
        <div><dt>Tjeneste</dt><dd>${escapeHtml(lead.service || "-")}</dd></div>
        <div><dt>Kilde</dt><dd>${escapeHtml(lead.source || "-")}</dd></div>
      </dl>
      <p>${escapeHtml(lead.message || "Ingen melding.")}</p>
      ${lead.notes ? `<p class="lead-note">${escapeHtml(lead.notes)}</p>` : ""}
    </article>
  `;
}

async function loadLeads(event) {
  event.preventDefault();

  const data = new FormData(form);
  const token = String(data.get("token") || "").trim();
  const q = String(data.get("q") || "").trim();

  if (!token) {
    statusText.textContent = "Skriv inn admin-token først.";
    return;
  }

  sessionStorage.setItem("mustaAdminToken", token);
  statusText.textContent = "Henter leads...";
  results.innerHTML = "";

  try {
    const response = await fetch(`/api/leads?q=${encodeURIComponent(q)}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(body.message || "Kunne ikke hente leads.");
    }

    const leads = body.leads || [];
    statusText.textContent = leads.length
      ? `Fant ${leads.length} henvendelse${leads.length === 1 ? "" : "r"}.`
      : "Ingen treff.";
    results.innerHTML = leads.map(leadCard).join("");
  } catch (error) {
    statusText.textContent = error.message;
  }
}

if (form) {
  const savedToken = sessionStorage.getItem("mustaAdminToken");
  if (savedToken) {
    form.elements.token.value = savedToken;
  }

  form.addEventListener("submit", loadLeads);
}

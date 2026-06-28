const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const form = document.querySelector("[data-contact-form]");
const statusText = document.querySelector("[data-form-status]");

function updateHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 10);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

if (navToggle && nav && header) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Åpne meny" : "Lukk meny");
    nav.classList.toggle("is-open", !isOpen);
    header.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Åpne meny");
      nav.classList.remove("is-open");
      header.classList.remove("is-open");
      document.body.classList.remove("nav-open");
    });
  });
}

if (form && statusText) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector("button[type='submit']");
    const buttonLabel = submitButton?.querySelector("span");
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    statusText.textContent = "Sender forespørselen...";
    if (submitButton) submitButton.disabled = true;
    if (buttonLabel) buttonLabel.textContent = "Sender...";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Kunne ikke sende skjemaet.");
      }

      statusText.textContent = "Takk! Forespørselen er sendt. Vi tar kontakt så snart vi kan.";
      form.reset();
    } catch (error) {
      statusText.textContent = "Beklager, skjemaet kunne ikke sendes akkurat nå. Send oss gjerne e-post direkte.";
    } finally {
      if (submitButton) submitButton.disabled = false;
      if (buttonLabel) buttonLabel.textContent = "Send forespørsel";
    }
  });
}

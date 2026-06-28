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
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get("name") || "";
    const email = data.get("email") || "";
    const company = data.get("company") || "";
    const service = data.get("service") || "";
    const message = data.get("message") || "";

    const subject = `Ny forespørsel fra ${company || name}`;
    const body = [
      `Navn: ${name}`,
      `E-post: ${email}`,
      `Bedrift: ${company}`,
      `Tjeneste: ${service}`,
      "",
      "Melding:",
      message
    ].join("\n");

    statusText.textContent = "E-postklienten åpnes med ferdig utfylt melding.";
    window.location.href = `mailto:post@mustadigital.no?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

const nodemailer = require("nodemailer");
const { insertLead } = require("./_crm");

function clean(value, maxLength = 2000) {
  return String(value || "").trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Kun POST er tillatt." });
  }

  const body = req.body || {};
  const name = clean(body.name, 120);
  const email = clean(body.email, 180);
  const phone = clean(body.phone, 80);
  const company = clean(body.company, 160);
  const service = clean(body.service, 160);
  const message = clean(body.message, 4000);
  const website = clean(body.website, 200);

  if (website) {
    return res.status(200).json({ ok: true });
  }

  if (!name || !email) {
    return res.status(400).json({ message: "Navn og e-post er påkrevd." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "E-postadressen ser ikke riktig ut." });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const contactTo = process.env.CONTACT_TO || smtpUser;
  const contactFrom = process.env.CONTACT_FROM || `"Musta Digital" <${smtpUser}>`;
  const smtpSecure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : smtpPort === 465;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return res.status(500).json({
      message: "Kontaktskjemaet mangler e-postoppsett i Vercel."
    });
  }

  const subject = `Ny foresporsel fra ${company || name}`;
  const lead = {
    source: "contact_form",
    status: "new",
    name,
    email,
    phone: phone || null,
    company: company || null,
    service: service || null,
    message: message || null,
    metadata: {
      privacy_version: "2026-06-29",
      user_agent: clean(req.headers["user-agent"], 500) || null
    }
  };

  try {
    await insertLead(lead);
  } catch (error) {
    console.error("Lead database insert failed", error);
  }

  const text = [
    `Navn: ${name}`,
    `E-post: ${email}`,
    `Telefon: ${phone || "-"}`,
    `Bedrift: ${company || "-"}`,
    `Tjeneste: ${service || "-"}`,
    "",
    "Melding:",
    message || "-"
  ].join("\n");

  const html = `
    <h2>Ny foresporsel fra nettsiden</h2>
    <p><strong>Navn:</strong> ${escapeHtml(name)}</p>
    <p><strong>E-post:</strong> ${escapeHtml(email)}</p>
    <p><strong>Telefon:</strong> ${escapeHtml(phone || "-")}</p>
    <p><strong>Bedrift:</strong> ${escapeHtml(company || "-")}</p>
    <p><strong>Tjeneste:</strong> ${escapeHtml(service || "-")}</p>
    <p><strong>Melding:</strong></p>
    <p>${escapeHtml(message || "-").replaceAll("\n", "<br>")}</p>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    await transporter.sendMail({
      from: contactFrom,
      to: contactTo,
      replyTo: email,
      subject,
      text,
      html
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Contact form failed", error);
    return res.status(500).json({
      message: "Kunne ikke sende foresporselen akkurat na."
    });
  }
};

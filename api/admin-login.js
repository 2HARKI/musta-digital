const { clean } = require("./_crm");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Kun POST er tillatt." });
  }

  const adminToken = clean(process.env.ADMIN_TOKEN, 500);
  if (!adminToken) {
    return res.status(503).json({ message: "Admininnlogging mangler ADMIN_TOKEN i Vercel." });
  }

  const token = clean(req.body?.token, 500);
  if (!token || token !== adminToken) {
    return res.status(401).json({ message: "Feil passord." });
  }

  return res.status(200).json({ ok: true });
};

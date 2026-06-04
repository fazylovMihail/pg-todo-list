const db = require("../db");
const { SessionSchema } = require("../api/Session");

module.exports = async function validateSession(req, res, next) {
  try {
    const session_id = req.cookies.session_id;

    if (!session_id) {
      return res.status(401).json({ error: "Сессия отсутствует." });
    }

    const [session] = await db
      .select("expires_at")
      .table("sessions")
      .where({ session_id });

    if (!session) {
      return res.status(401).json({ error: "Сессия недействительна." });
    }

    const validatedSession = SessionSchema.parse(session);

    const now = new Date();
    const expiresAt = new Date(validatedSession.expires_at);

    if (expiresAt < now) {
      await db.table("sessions").where({ session_id }).del();
      res.clearCookie("session_id");

      return res.status(401).json({ error: "Сессия истекла." });
    }

    req.session = validatedSession;
    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
};

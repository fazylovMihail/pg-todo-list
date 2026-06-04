const db = require("../db");

const findUserBySessionId = async (session_id) => {
  const session = await db
    .select()
    .table("sessions")
    .where({ session_id })
    .limit(1)
    .then((results) => results[0]);

  if (!session) return;

  return db
    .select()
    .table("users")
    .where({ id: session.user_id })
    .limit(1)
    .then((results) => results[0]);
};

module.exports = {
  findUserBySessionId,
};

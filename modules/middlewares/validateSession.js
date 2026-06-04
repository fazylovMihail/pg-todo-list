const { findUserBySessionId } = require("../utils");
const { UserScheme } = require("../api/User");

module.exports = async function validateSession(req, res, next) {
  try {
    const sessionId = req.cookies.session_id;

    if (!sessionId) {
      return next();
    }

    const user = await findUserBySessionId(sessionId);

    if (!user) {
      return next();
    }

    const validatedUser = UserScheme.parse(user);

    req.user = validatedUser;
    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
};

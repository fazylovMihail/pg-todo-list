const guestMiddleware = (req, res, next) => {
  if (req.user) {
    return res.status(400).json({ error: "Вы уже авторизованы." });
  }

  next();
};

const authMiddleware = (req, res, next) => {
  const user = req.user; // get user
  if (!user) {
    return res.status(401).json({ error: "Вы не авторизованы." });
  }

  next();
};

module.exports = { guestMiddleware, authMiddleware };

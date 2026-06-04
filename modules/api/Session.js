const z = require("zod");

const SessionSchema = z.object({
  session_id: z.string().length(21, "Длина ID сессии должна быть 21 символ."),
  user_id: z
    .string()
    .length(21, "Длина ID пользователя должна быть 21 символ."),
  created_at: z.coerce.date(),
  expires_at: z.coerce.date(),
});

module.exports = { SessionSchema };

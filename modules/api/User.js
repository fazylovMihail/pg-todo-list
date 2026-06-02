const z = require("zod");

const UserScheme = z.object({
  id: z.string().length(21, "Длина ID должна быть 21 символ."),
  name: z
    .string()
    .min(1, "Имя обязательно")
    .max(255, "Имя может содержать максимум 255 символов."),
  age: z.coerce
    .number()
    .int("Возраст должен быть целым числом.")
    .positive("Возраст должен быть положительным числом."),
  email: z.string().email("Неккоректный email."),
  password: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов.")
    .max(255, "Пароль может содержать максимум 255 символов."),
  created_at: z.coerce.date(),
});

const RegisterUserScheme = UserScheme.omit({ id: true, created_at: true });

const LoginUserScheme = UserScheme.omit({
  id: true,
  name: true,
  age: true,
  created_at: true,
});

const UsersListScheme = z.array(UserScheme);

module.exports = {
  UserScheme,
  RegisterUserScheme,
  LoginUserScheme,
  UsersListScheme,
};

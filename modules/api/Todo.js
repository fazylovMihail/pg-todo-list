const z = require("zod");
const { id } = require("zod/v4/locales");

const TodoSchema = z.object({
  todo_id: z.string().length(21, "Длина todo_id 21 символ"),
  user_id: z.string().length(21, "Длина user_id 21 символ"),
  title: z
    .string()
    .min(1, "Заголовок обязателен.")
    .max(255, "Заголовок не может быть больше 255 символов."),
  desc: z.string().optional(),
  created_at: z.coerce.date(),
});

const CreateTodoSchema = TodoSchema.omit({
  todo_id: true,
  user_id: true,
  created_at: true,
});

const UpdateTodoSchema = CreateTodoSchema.partial();

const TodoListSchema = z.array(TodoSchema);

module.exports = {
  TodoSchema,
  CreateTodoSchema,
  UpdateTodoSchema,
  TodoListSchema,
};

const express = require("express");
const db = require("../db");
const z = require("zod");
const {
  TodoListSchema,
  CreateTodoSchema,
  TodoSchema,
  UpdateTodoSchema,
} = require("../api/Todo");
const { nanoid } = require("nanoid");
const { requireAuth } = require("../middlewares/todos");

const route = express();

// middlewares
route.use(requireAuth);

route.get("/", async (req, res) => {
  try {
    const todos = await db.select().table("todos");
    const validatedTodos = TodoListSchema.parse(todos);

    res.status(200).json(validatedTodos);
  } catch (err) {
    console.error(err);

    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Ошибка типизации." });
    }

    res.status(500).json({ error: "Внутренняя ошибка сервера." });
  }
});

route.post("/", async (req, res) => {
  try {
    const { title, desc } = CreateTodoSchema.parse(req.body);
    const todo = {
      todo_id: nanoid(),
      user_id: user.id,
      title,
      desc,
    };

    const [todoId] = await db("todos").insert(todo).returning("todo_id");
    const todoUrl = `${req.protocol}://${req.get("host")}/users/${todoId}`; // create todo url

    res.set("Location", todoUrl); // set todo location
    res.status(201).json(todoId);
  } catch (err) {
    console.error(err);

    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Ошибка типизации." });
    }

    res.status(500).json({ error: "Внутренняя ошибка сервера." });
  }
});

route.patch("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = req.body;
    const validatedTodo = UpdateTodoSchema.parse(data);

    const updatedCount = await db("todos")
      .where({
        todo_id: id,
        user_id: req.user.id,
      })
      .update(validatedTodo);

    if (updatedCount === 0) {
      return res.status(404).json({ error: "Задача не найдена." });
    }

    res.sendStatus(204);
  } catch (err) {
    console.error(err);

    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Ошибка типизации." });
    }

    res.status(500).json({ error: "Внутренняя ошибка сервера." });
  }
});

route.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const deletedCount = await db("todos")
      .where({ todo_id: id, user_id: req.user.id })
      .delete();

    if (deletedCount === 0) {
      return res.status(404).json({ error: "Задача не найдена." });
    }

    res.sendStatus(204);
  } catch (err) {
    console.error(err);

    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Ошибка типизации." });
    }

    res.status(500).json({ error: "Внутренняя ошибка сервера." });
  }
});

module.exports = route;

// imports
const express = require("express");
const {
  RegisterUserScheme,
  LoginUserScheme,
  UserScheme,
} = require("../api/User");
const { ZodError } = require("zod");
const { nanoid } = require("nanoid");
const db = require("../db");
const { hash, compare } = require("bcrypt");
const {
  guestMiddleware,
  authMiddleware,
} = require("../middlewares/portValidate");

// constants
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
};

// handlers
const createHash = async (str) => {
  const saltOfRounts = 10;
  return await hash(str, saltOfRounts);
};

const createSession = async (user) => {
  const session = {
    session_id: nanoid(),
    user_id: user.id,
    expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  };

  const [row] = await db("sessions").insert(session).returning("session_id");

  return row.session_id;
};

const route = express.Router(); // auth route

// register request
route.post("/register", guestMiddleware, async (req, res) => {
  try {
    const data = req.body; // request data
    const { name, age, email, password } = RegisterUserScheme.parse(data); // validating request data

    // checking email existence
    const isUserExist = await db("users")
      .whereRaw("LOWER(email) = LOWER(?)", [email])
      .first();

    if (isUserExist) {
      return res
        .status(400)
        .json({ error: "Пользователь с таким email уже существует." });
    }

    const hashedPassword = await createHash(password); // hashing password

    // user data
    const user = {
      id: nanoid(),
      name,
      age,
      email: email.toLowerCase(),
      password: hashedPassword,
    };

    const [id] = await db("users").insert(user).returning("id"); // send user data
    const userUrl = `${req.protocol}://${req.get("host")}/users/${id}`; // create user url

    res.set("Location", userUrl); // set user location

    const sessionId = await createSession(user); // create session
    res.cookie("session_id", sessionId, COOKIE_OPTIONS); // create cookie

    const { password: _, ...result } = user; // create response data

    res.status(201).json(result); // send response
  } catch (err) {
    console.error(err);

    if (err instanceof ZodError) {
      return res.status(400).json({ error: "Ошибка типизации." });
    }

    res.status(500).json({ error: "Внутренняя ошибка сервера." });
  }
});

route.post("/login", guestMiddleware, async (req, res) => {
  try {
    if (req.user) {
      return res.status(400).json({ error: "Вы уже авторизованы." });
    }

    const data = req.body; // request data
    const { email, password } = LoginUserScheme.parse(data); // validating request data

    // receiving user
    const user = await db("users")
      .whereRaw("LOWER(email) = LOWER(?)", [email])
      .first();

    if (!user) {
      return res.status(400).json({ error: "Неверный email или пароль." });
    }

    // password check
    const isPasswordCorrect = await compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Неверный email или пароль." });
    }

    const validatedUser = UserScheme.parse(user); // validating user

    const sessionId = await createSession(validatedUser); // create session
    res.cookie("session_id", sessionId, COOKIE_OPTIONS); // create cookie

    const { password: _, ...result } = validatedUser; // create response data

    res.status(200).json(result); // send response
  } catch (err) {
    console.error(err);

    if (err instanceof ZodError) {
      return res.status(400).json({ error: "Ошибка типизации." });
    }

    res.status(500).json({ error: "Внутренняя ошибка сервера." });
  }
});

route.post("/logout", authMiddleware, async (req, res) => {
  try {
    const sessionId = req.cookies.session_id; // get session
    if (!sessionId) {
      return res.sendStatus(400);
    }

    res.clearCookie("session_id", COOKIE_OPTIONS); // clear cookie session token

    // delete session
    const deletedCount = await db("sessions")
      .where({ session_id: sessionId, user_id: req.user.id })
      .delete();

    if (deletedCount === 0) {
      return res.status(404).json({ error: "Сессия не найдена." });
    }

    res.sendStatus(204); // send response
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Внутренняя ошибка сервера." });
  }
});

// export
module.exports = route;

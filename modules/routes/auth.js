// imports
const express = require("express");
const { RegisterUserScheme, LoginUserScheme } = require("../api/User");
const { ZodError } = require("zod");
const { nanoid } = require("nanoid");
const db = require("../db");
const { hash, compare } = require("bcrypt");

// handlers
const createHash = async (str) => {
  const saltOfRounts = 10;
  return await hash(str, saltOfRounts);
};

const route = express.Router(); // auth route

// register request
route.post("/register", async (req, res) => {
  try {
    const data = req.body; // request data
    const { name, age, email, password } = RegisterUserScheme.parse(data); // validating request data

    // checking email existence
    const existingUser = await db("users")
      .whereRaw("LOWER(email) = LOWER(?)", [email])
      .first();

    if (existingUser) {
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

module.exports = route;

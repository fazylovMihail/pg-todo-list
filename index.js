require("dotenv").config(); // dotenv config

// imports
const express = require("express");
const cookieParser = require("cookie-parser");
const authRoute = require("./modules/routes/auth");
const todosRoute = require("./modules/routes/todos");
const db = require("./modules/db");
const validateSession = require("./modules/middlewares/validateSession");

const app = express(); // main route

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(validateSession);

// routes
app.use("/auth", authRoute);
app.use("/todos", todosRoute);

// launch server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`   Server listen on http://localhost:${PORT}`);
});

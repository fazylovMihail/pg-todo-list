exports.up = function (knex) {
  return knex.schema.createTable("todos", (table) => {
    table.string("todo_id", 21).primary().notNullable();
    table
      .string("user_id", 21)
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("title", 255).notNullable();
    table.string("desc");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("todos");
};

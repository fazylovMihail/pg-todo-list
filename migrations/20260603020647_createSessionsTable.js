exports.up = function (knex) {
  return knex.schema.createTable("sessions", (table) => {
    table.string("session_id", 21).primary().notNullable();
    table
      .string("user_id", 21)
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.index(["user_id"]);
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("sessions");
};

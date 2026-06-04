exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.string("id", 21).primary().notNullable();
    table.string("name", 255).notNullable();
    table.integer("age").notNullable();
    table.string("email", 254).notNullable().unique();
    table.string("password", 60).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("users");
};

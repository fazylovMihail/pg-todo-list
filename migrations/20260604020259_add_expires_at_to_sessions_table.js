exports.up = function (knex) {
  return knex.schema.table("sessions", (table) => {
    table
      .timestamp("expires_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.raw("NOW() + INTERVAL '3 days'"));
  });
};

exports.down = function (knex) {
  return knex.schema.table("sessions", function (table) {
    table.dropColumn("expires_at");
  });
};

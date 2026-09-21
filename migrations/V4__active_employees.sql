CREATE TABLE IF NOT EXISTS "public"."active_employees"
(
    employee_id         TEXT PRIMARY KEY,
    employee_first_name TEXT NOT NULL,
    employee_last_name  TEXT NOT NULL,
    employee_role       TEXT NOT NULL
);

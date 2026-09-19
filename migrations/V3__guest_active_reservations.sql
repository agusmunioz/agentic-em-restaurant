CREATE TABLE IF NOT EXISTS "public"."guest_active_reservations"
(
    reservation_id   TEXT PRIMARY KEY,
    reservation_code TEXT NOT NULL,
    day              DATE NOT NULL,
    start_time       TEXT NOT NULL,
    end_time         TEXT NOT NULL,
    guests_number    INTEGER NOT NULL,
    email            TEXT NOT NULL
);

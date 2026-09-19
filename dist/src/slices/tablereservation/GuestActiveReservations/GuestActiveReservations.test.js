"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const emmett_postgresql_1 = require("@event-driven-io/emmett-postgresql");
const GuestActiveReservationsProjection_1 = require("./GuestActiveReservationsProjection");
const postgresql_1 = require("@testcontainers/postgresql");
const knex_1 = __importDefault(require("knex"));
const assert_1 = __importDefault(require("assert"));
const testHelpers_1 = require("../../../common/testHelpers");
const RESERVATION_ID = '1232-ASD-123';
(0, node_test_1.describe)('Guest Active Reservations Specification', () => {
    let postgres;
    let connectionString;
    let db;
    let given;
    (0, node_test_1.before)(() => __awaiter(void 0, void 0, void 0, function* () {
        postgres = yield new postgresql_1.PostgreSqlContainer('postgres').start();
        connectionString = postgres.getConnectionUri();
        db = (0, knex_1.default)({ client: 'pg', connection: connectionString });
        yield (0, testHelpers_1.runFlywayMigrations)(connectionString);
        given = emmett_postgresql_1.PostgreSQLProjectionSpec.for({
            projection: GuestActiveReservationsProjection_1.GuestActiveReservationsProjection,
            connectionString,
        });
    }));
    (0, node_test_1.after)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (db === null || db === void 0 ? void 0 : db.destroy());
        yield (postgres === null || postgres === void 0 ? void 0 : postgres.stop());
    }));
    (0, node_test_1.it)('spec: Guest active reservations are listed', () => __awaiter(void 0, void 0, void 0, function* () {
        const assertReadModel = (_a) => __awaiter(void 0, [_a], void 0, function* ({ connectionString: connStr }) {
            const queryDb = (0, knex_1.default)({ client: 'pg', connection: connStr });
            try {
                const result = yield queryDb('guest_active_reservations')
                    .withSchema('public')
                    .where({ reservation_id: RESERVATION_ID })
                    .first();
                assert_1.default.ok(result, 'row should exist');
                assert_1.default.strictEqual(result.reservation_code, '12ZD3C');
                assert_1.default.strictEqual(result.start_time, '11:00');
                assert_1.default.strictEqual(result.end_time, '13:00');
                assert_1.default.strictEqual(result.guests_number, 4);
                assert_1.default.strictEqual(result.email, 'hey@email.com');
            }
            finally {
                yield queryDb.destroy();
            }
        });
        yield given([{
                type: 'ReservationPlaced',
                data: {
                    reservation_id: RESERVATION_ID,
                    reservation_code: '12ZD3C',
                    email: 'hey@email.com',
                    day: '20206-10-12',
                    start_time: '11:00',
                    end_time: '13:00',
                    guests_number: 4,
                },
                metadata: { stream_name: `table-reservation-20206-10-12` },
            }])
            .when([])
            .then(assertReadModel);
    }));
    (0, node_test_1.it)('spec: Guest Active Reservations - cancelled reservation is delisted', () => __awaiter(void 0, void 0, void 0, function* () {
        const assertReadModel = (_a) => __awaiter(void 0, [_a], void 0, function* ({ connectionString: connStr }) {
            const queryDb = (0, knex_1.default)({ client: 'pg', connection: connStr });
            try {
                const result = yield queryDb('guest_active_reservations')
                    .withSchema('public')
                    .where({ reservation_id: RESERVATION_ID })
                    .first();
                assert_1.default.strictEqual(result, undefined, 'row should be deleted');
            }
            finally {
                yield queryDb.destroy();
            }
        });
        yield given([
            {
                type: 'ReservationPlaced',
                data: {
                    reservation_id: RESERVATION_ID,
                    reservation_code: '12ZD3C',
                    email: 'hey@email.com',
                    day: '20206-10-12',
                    start_time: '11:00',
                    end_time: '13:00',
                    guests_number: 4,
                },
                metadata: { stream_name: `table-reservation-20206-10-12` },
            },
            {
                type: 'ReservationCancelledByGuest',
                data: { reservation_id: RESERVATION_ID },
                metadata: { stream_name: `table-reservation-20206-10-12` },
            },
        ])
            .when([])
            .then(assertReadModel);
    }));
});

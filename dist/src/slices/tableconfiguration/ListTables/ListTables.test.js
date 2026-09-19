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
const ListTablesProjection_1 = require("./ListTablesProjection");
const postgresql_1 = require("@testcontainers/postgresql");
const knex_1 = __importDefault(require("knex"));
const assert_1 = __importDefault(require("assert"));
const testHelpers_1 = require("../../../common/testHelpers");
const TABLE_ID = '123-1239-123';
(0, node_test_1.describe)('List Tables Specification', () => {
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
            projection: ListTablesProjection_1.ListTablesProjection,
            connectionString,
        });
    }));
    (0, node_test_1.after)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (db === null || db === void 0 ? void 0 : db.destroy());
        yield (postgres === null || postgres === void 0 ? void 0 : postgres.stop());
    }));
    (0, node_test_1.describe)('Storyline: Added table is listed', () => {
        (0, node_test_1.it)('spec: Added table is listed — after TableAdded', () => __awaiter(void 0, void 0, void 0, function* () {
            const assertReadModel = (_a) => __awaiter(void 0, [_a], void 0, function* ({ connectionString: connStr }) {
                const queryDb = (0, knex_1.default)({ client: 'pg', connection: connStr });
                try {
                    const result = yield queryDb('tables')
                        .withSchema('public')
                        .where({ table_id: TABLE_ID })
                        .first();
                    assert_1.default.ok(result, 'row should exist');
                    assert_1.default.strictEqual(result.table_id, TABLE_ID);
                    assert_1.default.strictEqual(result.table_number, 1);
                    assert_1.default.strictEqual(result.seats, 4);
                }
                finally {
                    yield queryDb.destroy();
                }
            });
            yield given([{
                    type: 'TableAdded',
                    data: { table_id: TABLE_ID, table_number: 1, seats: 4 },
                    metadata: { stream_name: `table-configuration-${TABLE_ID}` },
                }])
                .when([])
                .then(assertReadModel);
        }));
    });
    (0, node_test_1.it)('spec: List Tables - removed table is delisted', () => __awaiter(void 0, void 0, void 0, function* () {
        const assertReadModel = (_a) => __awaiter(void 0, [_a], void 0, function* ({ connectionString: connStr }) {
            const queryDb = (0, knex_1.default)({ client: 'pg', connection: connStr });
            try {
                const result = yield queryDb('tables')
                    .withSchema('public')
                    .where({ table_id: TABLE_ID })
                    .first();
                assert_1.default.strictEqual(result, undefined, 'row should be deleted');
            }
            finally {
                yield queryDb.destroy();
            }
        });
        yield given([
            {
                type: 'TableAdded',
                data: { table_id: TABLE_ID, table_number: 1, seats: 4 },
                metadata: { stream_name: `table-configuration-${TABLE_ID}` },
            },
            {
                type: 'TableRemoved',
                data: { table_id: TABLE_ID },
                metadata: { stream_name: `table-configuration-${TABLE_ID}` },
            },
        ])
            .when([])
            .then(assertReadModel);
    }));
    (0, node_test_1.it)('spec: List Tables - updated seats are reflected', () => __awaiter(void 0, void 0, void 0, function* () {
        const assertReadModel = (_a) => __awaiter(void 0, [_a], void 0, function* ({ connectionString: connStr }) {
            const queryDb = (0, knex_1.default)({ client: 'pg', connection: connStr });
            try {
                const result = yield queryDb('tables')
                    .withSchema('public')
                    .where({ table_id: TABLE_ID })
                    .first();
                assert_1.default.ok(result, 'row should exist');
                assert_1.default.strictEqual(result.table_number, 1);
                assert_1.default.strictEqual(result.seats, 6);
            }
            finally {
                yield queryDb.destroy();
            }
        });
        yield given([
            {
                type: 'TableAdded',
                data: { table_id: TABLE_ID, table_number: 1, seats: 4 },
                metadata: { stream_name: `table-configuration-${TABLE_ID}` },
            },
            {
                type: 'TableSeatsUpdated',
                data: { table_id: TABLE_ID, seats: 6 },
                metadata: { stream_name: `table-configuration-${TABLE_ID}` },
            },
        ])
            .when([])
            .then(assertReadModel);
    }));
});

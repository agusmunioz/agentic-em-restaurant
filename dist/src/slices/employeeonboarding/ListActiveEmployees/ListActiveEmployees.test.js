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
const ActiveEmployeesProjection_1 = require("./ActiveEmployeesProjection");
const postgresql_1 = require("@testcontainers/postgresql");
const knex_1 = __importDefault(require("knex"));
const assert_1 = __importDefault(require("assert"));
const testHelpers_1 = require("../../../common/testHelpers");
const EMPLOYEE_ID = '231-123AS-das';
(0, node_test_1.describe)('List Active Employees Specification', () => {
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
            projection: ActiveEmployeesProjection_1.ActiveEmployeesProjection,
            connectionString,
        });
    }));
    (0, node_test_1.after)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (db === null || db === void 0 ? void 0 : db.destroy());
        yield (postgres === null || postgres === void 0 ? void 0 : postgres.stop());
    }));
    (0, node_test_1.describe)('Storyline: Created employee is listed', () => {
        (0, node_test_1.it)('spec: Manager views the list of active employees — after EmployeeCreated', () => __awaiter(void 0, void 0, void 0, function* () {
            const assertReadModel = (_a) => __awaiter(void 0, [_a], void 0, function* ({ connectionString: connStr }) {
                const queryDb = (0, knex_1.default)({ client: 'pg', connection: connStr });
                try {
                    const result = yield queryDb('active_employees')
                        .withSchema('public')
                        .where({ employee_id: EMPLOYEE_ID })
                        .first();
                    assert_1.default.ok(result, 'row should exist');
                    assert_1.default.strictEqual(result.employee_id, EMPLOYEE_ID);
                    assert_1.default.strictEqual(result.employee_first_name, 'Tom');
                    assert_1.default.strictEqual(result.employee_last_name, 'Becker');
                    assert_1.default.strictEqual(result.employee_role, 'cooker');
                }
                finally {
                    yield queryDb.destroy();
                }
            });
            yield given([{
                    type: 'EmployeeCreated',
                    data: {
                        employee_id: EMPLOYEE_ID,
                        employee_first_name: 'Tom',
                        employee_last_name: 'Becker',
                        employee_role: 'cooker',
                    },
                    metadata: { stream_name: `employee-onboarding-${EMPLOYEE_ID}` },
                }])
                .when([])
                .then(assertReadModel);
        }));
    });
    (0, node_test_1.it)('spec: List Active Employees - deleted employee is delisted', () => __awaiter(void 0, void 0, void 0, function* () {
        const assertReadModel = (_a) => __awaiter(void 0, [_a], void 0, function* ({ connectionString: connStr }) {
            const queryDb = (0, knex_1.default)({ client: 'pg', connection: connStr });
            try {
                const result = yield queryDb('active_employees')
                    .withSchema('public')
                    .where({ employee_id: EMPLOYEE_ID })
                    .first();
                assert_1.default.strictEqual(result, undefined, 'row should be deleted');
            }
            finally {
                yield queryDb.destroy();
            }
        });
        yield given([
            {
                type: 'EmployeeCreated',
                data: {
                    employee_id: EMPLOYEE_ID,
                    employee_first_name: 'Tom',
                    employee_last_name: 'Becker',
                    employee_role: 'cooker',
                },
                metadata: { stream_name: `employee-onboarding-${EMPLOYEE_ID}` },
            },
            {
                type: 'EmployeeDeleted',
                data: { employee_id: EMPLOYEE_ID },
                metadata: { stream_name: `employee-onboarding-${EMPLOYEE_ID}` },
            },
        ])
            .when([])
            .then(assertReadModel);
    }));
});

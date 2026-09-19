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
const emmett_1 = require("@event-driven-io/emmett");
const AddTableCommand_1 = require("./AddTableCommand");
const node_test_1 = require("node:test");
const assert_1 = __importDefault(require("assert"));
const postgresql_1 = require("@testcontainers/postgresql");
const knex_1 = __importDefault(require("knex"));
const testHelpers_1 = require("../../../common/testHelpers");
(0, node_test_1.describe)('Add Table Specification', () => {
    const given = emmett_1.DeciderSpecification.for({
        decide: (command, state) => (0, AddTableCommand_1.decide)(command, state, '123-abc'),
        evolve: AddTableCommand_1.evolve,
        initialState: AddTableCommand_1.AddTableInitialState,
    });
    (0, node_test_1.it)('spec: Add Table - Add table succesfully', () => {
        const command = {
            type: 'AddTable',
            data: {
                table_number: 1,
                seats: 4,
            },
            metadata: {},
        };
        given([])
            .when(command)
            .then([{
                type: 'TableAdded',
                data: {
                    table_id: '123-abc',
                    table_number: 1,
                    seats: 4,
                },
                metadata: {
                    correlation_id: undefined,
                    causation_id: undefined,
                },
            }]);
    });
    (0, node_test_1.it)('spec: Add Table - Seats must be bigger than zero', () => {
        const command = {
            type: 'AddTable',
            data: {
                table_number: 1,
                seats: 0,
            },
            metadata: {},
        };
        given([])
            .when(command)
            .thenThrows();
    });
});
(0, node_test_1.describe)('Add Table - table number uniqueness guard', () => {
    let postgres;
    let db;
    (0, node_test_1.before)(() => __awaiter(void 0, void 0, void 0, function* () {
        postgres = yield new postgresql_1.PostgreSqlContainer('postgres').start();
        const connectionString = postgres.getConnectionUri();
        yield (0, testHelpers_1.runFlywayMigrations)(connectionString);
        db = (0, knex_1.default)({ client: 'pg', connection: connectionString });
    }));
    (0, node_test_1.after)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (db === null || db === void 0 ? void 0 : db.destroy());
        yield (postgres === null || postgres === void 0 ? void 0 : postgres.stop());
    }));
    (0, node_test_1.it)('spec: Add Table - Table number is unique', () => __awaiter(void 0, void 0, void 0, function* () {
        yield db('tables').withSchema('public').insert({
            table_id: 'existing-table-id',
            table_number: 1,
            seats: 4,
        });
        assert_1.default.strictEqual(yield (0, AddTableCommand_1.isTableNumberTaken)(db, 1), true);
        assert_1.default.strictEqual(yield (0, AddTableCommand_1.isTableNumberTaken)(db, 2), false);
    }));
});

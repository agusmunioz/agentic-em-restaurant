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
exports.ListTablesProjection = exports.getKnexInstance = exports.tableName = void 0;
const emmett_postgresql_1 = require("@event-driven-io/emmett-postgresql");
const dumbo_1 = require("@event-driven-io/dumbo");
const knex_1 = __importDefault(require("knex"));
exports.tableName = 'tables';
const getKnexInstance = () => (0, knex_1.default)({ client: 'pg' });
exports.getKnexInstance = getKnexInstance;
exports.ListTablesProjection = (0, emmett_postgresql_1.postgreSQLRawSQLProjection)({
    name: 'ListTablesProjection',
    canHandle: ['TableAdded', 'TableRemoved', 'TableSeatsUpdated'],
    evolve: (event) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, exports.getKnexInstance)();
        switch (event.type) {
            case 'TableAdded':
                return [(0, dumbo_1.sql)(db(exports.tableName)
                        .withSchema('public')
                        .insert({
                        table_id: event.data.table_id,
                        table_number: event.data.table_number,
                        seats: event.data.seats,
                    })
                        .onConflict('table_id')
                        .merge(['table_number', 'seats'])
                        .toQuery())];
            case 'TableRemoved':
                return [(0, dumbo_1.sql)(db(exports.tableName)
                        .withSchema('public')
                        .where({ table_id: event.data.table_id })
                        .delete()
                        .toQuery())];
            case 'TableSeatsUpdated':
                return [(0, dumbo_1.sql)(db(exports.tableName)
                        .withSchema('public')
                        .where({ table_id: event.data.table_id })
                        .update({ seats: event.data.seats })
                        .toQuery())];
            default:
                return [];
        }
    }),
});

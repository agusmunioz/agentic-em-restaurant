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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAddTable = exports.isTableNumberTaken = exports.decide = exports.evolve = exports.AddTableInitialState = void 0;
const emmett_1 = require("@event-driven-io/emmett");
const crypto_1 = require("crypto");
const loadPostgresEventstore_1 = require("../../../common/loadPostgresEventstore");
const db_1 = require("../../../common/db");
const AddTableInitialState = () => ({});
exports.AddTableInitialState = AddTableInitialState;
const evolve = (state, _event) => state;
exports.evolve = evolve;
const generateTableId = () => (0, crypto_1.randomUUID)();
// The table aggregate is identified by table_id (its stream key), generated
// before deciding so it's available to both the event and the stream id.
// table_number uniqueness can't be checked via single-stream replay against
// a fresh, never-before-used table_id stream, so it's enforced separately —
// see isTableNumberTaken, checked against the Tables read model before this
// runs.
const decide = (command, _state, tableId = generateTableId()) => {
    var _a, _b;
    if (command.data.seats <= 0) {
        throw { code: 'seats_not_positive', message: 'Seats must be bigger than zero' };
    }
    return [{
            type: 'TableAdded',
            data: {
                table_id: tableId,
                table_number: command.data.table_number,
                seats: command.data.seats,
            },
            metadata: {
                correlation_id: (_a = command.metadata) === null || _a === void 0 ? void 0 : _a.correlation_id,
                causation_id: (_b = command.metadata) === null || _b === void 0 ? void 0 : _b.causation_id,
            },
        }];
};
exports.decide = decide;
const isTableNumberTaken = (db, tableNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield db('tables')
        .withSchema('public')
        .where({ table_number: tableNumber })
        .first();
    return existing !== undefined;
});
exports.isTableNumberTaken = isTableNumberTaken;
const AddTableCommandHandler = (0, emmett_1.CommandHandler)({
    evolve: exports.evolve,
    initialState: exports.AddTableInitialState,
});
const handleAddTable = (command) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield (0, exports.isTableNumberTaken)((0, db_1.getKnexInstance)(), command.data.table_number)) {
        throw { code: 'table_number_not_unique', message: 'A table with the same number already exists' };
    }
    const eventStore = yield (0, loadPostgresEventstore_1.findEventstore)();
    const tableId = generateTableId();
    const streamId = `table-configuration-${tableId}`;
    const result = yield AddTableCommandHandler(eventStore, streamId, (state) => (0, exports.decide)(command, state, tableId));
    return {
        nextExpectedStreamVersion: result.nextExpectedStreamVersion,
        lastEventGlobalPosition: result.lastEventGlobalPosition,
        newEvents: result.newEvents,
    };
});
exports.handleAddTable = handleAddTable;

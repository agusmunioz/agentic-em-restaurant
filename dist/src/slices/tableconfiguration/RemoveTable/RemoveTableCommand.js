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
exports.handleRemoveTable = exports.decide = exports.evolve = exports.RemoveTableInitialState = void 0;
const emmett_1 = require("@event-driven-io/emmett");
const loadPostgresEventstore_1 = require("../../../common/loadPostgresEventstore");
const RemoveTableInitialState = () => ({
    exists: false,
});
exports.RemoveTableInitialState = RemoveTableInitialState;
const evolve = (state, event) => {
    const { type } = event;
    switch (type) {
        case 'TableAdded':
            return { exists: true };
        case 'TableRemoved':
            return { exists: false };
        default:
            return state;
    }
};
exports.evolve = evolve;
const decide = (command, state) => {
    var _a, _b;
    if (!state.exists) {
        throw { code: 'table_not_found', message: 'Unable to remove non existing table' };
    }
    return [{
            type: 'TableRemoved',
            data: {
                table_id: command.data.table_id,
            },
            metadata: {
                correlation_id: (_a = command.metadata) === null || _a === void 0 ? void 0 : _a.correlation_id,
                causation_id: (_b = command.metadata) === null || _b === void 0 ? void 0 : _b.causation_id,
            },
        }];
};
exports.decide = decide;
const RemoveTableCommandHandler = (0, emmett_1.CommandHandler)({
    evolve: exports.evolve,
    initialState: exports.RemoveTableInitialState,
});
const handleRemoveTable = (command) => __awaiter(void 0, void 0, void 0, function* () {
    const eventStore = yield (0, loadPostgresEventstore_1.findEventstore)();
    const streamId = `table-configuration-${command.data.table_id}`;
    const result = yield RemoveTableCommandHandler(eventStore, streamId, (state) => (0, exports.decide)(command, state));
    return {
        nextExpectedStreamVersion: result.nextExpectedStreamVersion,
        lastEventGlobalPosition: result.lastEventGlobalPosition,
        newEvents: result.newEvents,
    };
});
exports.handleRemoveTable = handleRemoveTable;

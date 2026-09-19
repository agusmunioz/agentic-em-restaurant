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
exports.handleUpdateTableSeats = exports.decide = exports.evolve = exports.UpdateTableSeatsInitialState = void 0;
const emmett_1 = require("@event-driven-io/emmett");
const loadPostgresEventstore_1 = require("../../../common/loadPostgresEventstore");
const UpdateTableSeatsInitialState = () => ({});
exports.UpdateTableSeatsInitialState = UpdateTableSeatsInitialState;
const evolve = (state, _event) => state;
exports.evolve = evolve;
const decide = (command, _state) => {
    var _a, _b;
    return [{
            type: 'TableSeatsUpdated',
            data: {
                table_id: command.data.table_id,
                seats: command.data.seats,
            },
            metadata: {
                correlation_id: (_a = command.metadata) === null || _a === void 0 ? void 0 : _a.correlation_id,
                causation_id: (_b = command.metadata) === null || _b === void 0 ? void 0 : _b.causation_id,
            },
        }];
};
exports.decide = decide;
const UpdateTableSeatsCommandHandler = (0, emmett_1.CommandHandler)({
    evolve: exports.evolve,
    initialState: exports.UpdateTableSeatsInitialState,
});
const handleUpdateTableSeats = (command) => __awaiter(void 0, void 0, void 0, function* () {
    const eventStore = yield (0, loadPostgresEventstore_1.findEventstore)();
    const streamId = `table-configuration-${command.data.table_id}`;
    const result = yield UpdateTableSeatsCommandHandler(eventStore, streamId, (state) => (0, exports.decide)(command, state));
    return {
        nextExpectedStreamVersion: result.nextExpectedStreamVersion,
        lastEventGlobalPosition: result.lastEventGlobalPosition,
        newEvents: result.newEvents,
    };
});
exports.handleUpdateTableSeats = handleUpdateTableSeats;

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
exports.handleCancelReservationByGuest = exports.decide = exports.evolve = exports.CancelReservationByGuestInitialState = void 0;
const emmett_1 = require("@event-driven-io/emmett");
const loadPostgresEventstore_1 = require("../../../common/loadPostgresEventstore");
const db_1 = require("../../../common/db");
const ReservationDayIndexProjection_1 = require("./ReservationDayIndexProjection");
const CancelReservationByGuestInitialState = () => ({
    reservations: {},
});
exports.CancelReservationByGuestInitialState = CancelReservationByGuestInitialState;
const evolve = (state, event) => {
    const { type } = event;
    switch (type) {
        case 'ReservationPlaced':
            return {
                reservations: Object.assign(Object.assign({}, state.reservations), { [event.data.reservation_id]: { cancelled: false } }),
            };
        case 'ReservationCancelledByGuest':
            return {
                reservations: Object.assign(Object.assign({}, state.reservations), { [event.data.reservation_id]: { cancelled: true } }),
            };
        default:
            return state;
    }
};
exports.evolve = evolve;
const decide = (command, state) => {
    var _a, _b;
    const entry = state.reservations[command.data.reservation_id];
    if (!entry) {
        throw { code: 'reservation_not_found', message: 'Cannot cancel a non existing reservation' };
    }
    if (entry.cancelled) {
        throw { code: 'reservation_already_cancelled', message: 'Cancelling a canceled reservation is not allowed' };
    }
    return [{
            type: 'ReservationCancelledByGuest',
            data: {
                reservation_id: command.data.reservation_id,
            },
            metadata: {
                correlation_id: (_a = command.metadata) === null || _a === void 0 ? void 0 : _a.correlation_id,
                causation_id: (_b = command.metadata) === null || _b === void 0 ? void 0 : _b.causation_id,
            },
        }];
};
exports.decide = decide;
const CancelReservationByGuestCommandHandler = (0, emmett_1.CommandHandler)({
    evolve: exports.evolve,
    initialState: exports.CancelReservationByGuestInitialState,
});
const handleCancelReservationByGuest = (command) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, db_1.getKnexInstance)();
    const indexRow = yield db(ReservationDayIndexProjection_1.tableName)
        .withSchema('public')
        .where({ reservation_id: command.data.reservation_id })
        .first();
    if (!indexRow) {
        throw { code: 'reservation_not_found', message: 'Cannot cancel a non existing reservation' };
    }
    const eventStore = yield (0, loadPostgresEventstore_1.findEventstore)();
    const streamId = `table-reservation-${indexRow.day}`;
    const result = yield CancelReservationByGuestCommandHandler(eventStore, streamId, (state) => (0, exports.decide)(command, state));
    return {
        nextExpectedStreamVersion: result.nextExpectedStreamVersion,
        lastEventGlobalPosition: result.lastEventGlobalPosition,
        newEvents: result.newEvents,
    };
});
exports.handleCancelReservationByGuest = handleCancelReservationByGuest;

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
exports.handlePlaceReservation = exports.decide = exports.evolve = exports.PlaceReservationInitialState = void 0;
const emmett_1 = require("@event-driven-io/emmett");
const crypto_1 = require("crypto");
const loadPostgresEventstore_1 = require("../../../common/loadPostgresEventstore");
const PlaceReservationInitialState = () => ({
    reservations: [],
});
exports.PlaceReservationInitialState = PlaceReservationInitialState;
const evolve = (state, event) => {
    const { type } = event;
    switch (type) {
        case 'ReservationPlaced':
            return {
                reservations: [
                    ...state.reservations,
                    { start_time: event.data.start_time, end_time: event.data.end_time },
                ],
            };
        default:
            return state;
    }
};
exports.evolve = evolve;
const generateReservationId = () => (0, crypto_1.randomUUID)();
const CODE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const generateReservationCode = () => {
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += CODE_CHARACTERS[Math.floor(Math.random() * CODE_CHARACTERS.length)];
    }
    return code;
};
const toMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};
// new Date(day) parses a date-only string as UTC midnight, while
// startOfToday is local midnight — in a timezone behind UTC that makes
// today's date compare as earlier than "now", rejecting same-day
// reservations. Parse day as local date components instead.
const isInThePast = (day) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const [year, month, date] = day.split('-').map(Number);
    const reservationDay = new Date(year, month - 1, date);
    return reservationDay < startOfToday;
};
const decide = (command, state, reservationId = generateReservationId(), reservationCode = generateReservationCode()) => {
    var _a, _b;
    const { email, day, start_time, end_time, guests_number } = command.data;
    if (guests_number <= 0) {
        throw { code: 'guests_number_not_positive', message: 'Guest number must be positive' };
    }
    const startMinutes = toMinutes(start_time);
    const endMinutes = toMinutes(end_time);
    if (startMinutes >= endMinutes) {
        throw { code: 'invalid_time_range', message: 'Start time cannot be after end time' };
    }
    if (isInThePast(day)) {
        throw { code: 'reservation_in_the_past', message: 'A reservation in the past is not allowed' };
    }
    const overlaps = state.reservations.some((reservation) => {
        const existingStart = toMinutes(reservation.start_time);
        const existingEnd = toMinutes(reservation.end_time);
        return startMinutes < existingEnd && existingStart < endMinutes;
    });
    if (overlaps) {
        throw { code: 'reservation_overlap', message: 'Table is already reserved at the moment' };
    }
    return [{
            type: 'ReservationPlaced',
            data: {
                reservation_id: reservationId,
                reservation_code: reservationCode,
                email,
                day,
                start_time,
                end_time,
                guests_number,
            },
            metadata: {
                correlation_id: (_a = command.metadata) === null || _a === void 0 ? void 0 : _a.correlation_id,
                causation_id: (_b = command.metadata) === null || _b === void 0 ? void 0 : _b.causation_id,
            },
        }];
};
exports.decide = decide;
const PlaceReservationCommandHandler = (0, emmett_1.CommandHandler)({
    evolve: exports.evolve,
    initialState: exports.PlaceReservationInitialState,
});
const handlePlaceReservation = (command) => __awaiter(void 0, void 0, void 0, function* () {
    const eventStore = yield (0, loadPostgresEventstore_1.findEventstore)();
    const streamId = `table-reservation-${command.data.day}`;
    const result = yield PlaceReservationCommandHandler(eventStore, streamId, (state) => (0, exports.decide)(command, state));
    return {
        nextExpectedStreamVersion: result.nextExpectedStreamVersion,
        lastEventGlobalPosition: result.lastEventGlobalPosition,
        newEvents: result.newEvents,
    };
});
exports.handlePlaceReservation = handlePlaceReservation;

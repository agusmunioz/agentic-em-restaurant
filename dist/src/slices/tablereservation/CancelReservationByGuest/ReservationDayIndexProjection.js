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
exports.ReservationDayIndexProjection = exports.getKnexInstance = exports.tableName = void 0;
const emmett_postgresql_1 = require("@event-driven-io/emmett-postgresql");
const dumbo_1 = require("@event-driven-io/dumbo");
const knex_1 = __importDefault(require("knex"));
// PlaceReservation's stream is keyed by day (`table-reservation-${day}`), not by
// reservation_id, so cancelling by reservation_id alone needs a way to find the
// stream to append to. This table maps reservation_id -> day and is never deleted
// on cancellation, so a repeat-cancel can still be routed to the right stream and
// correctly rejected as "already cancelled" rather than "not found".
exports.tableName = 'reservation_day_index';
const getKnexInstance = () => (0, knex_1.default)({ client: 'pg' });
exports.getKnexInstance = getKnexInstance;
exports.ReservationDayIndexProjection = (0, emmett_postgresql_1.postgreSQLRawSQLProjection)({
    name: 'ReservationDayIndexProjection',
    canHandle: ['ReservationPlaced'],
    evolve: (event) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, exports.getKnexInstance)();
        switch (event.type) {
            case 'ReservationPlaced':
                return [(0, dumbo_1.sql)(db(exports.tableName)
                        .withSchema('public')
                        .insert({
                        reservation_id: event.data.reservation_id,
                        day: event.data.day,
                    })
                        .onConflict('reservation_id')
                        .ignore()
                        .toQuery())];
            default:
                return [];
        }
    }),
});

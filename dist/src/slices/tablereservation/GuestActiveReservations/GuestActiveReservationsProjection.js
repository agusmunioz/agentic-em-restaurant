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
exports.GuestActiveReservationsProjection = exports.getKnexInstance = exports.tableName = void 0;
const emmett_postgresql_1 = require("@event-driven-io/emmett-postgresql");
const dumbo_1 = require("@event-driven-io/dumbo");
const knex_1 = __importDefault(require("knex"));
exports.tableName = 'guest_active_reservations';
const getKnexInstance = () => (0, knex_1.default)({ client: 'pg' });
exports.getKnexInstance = getKnexInstance;
exports.GuestActiveReservationsProjection = (0, emmett_postgresql_1.postgreSQLRawSQLProjection)({
    name: 'GuestActiveReservationsProjection',
    canHandle: ['ReservationPlaced', 'ReservationCancelledByGuest'],
    evolve: (event) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, exports.getKnexInstance)();
        switch (event.type) {
            case 'ReservationPlaced':
                return [(0, dumbo_1.sql)(db(exports.tableName)
                        .withSchema('public')
                        .insert({
                        reservation_id: event.data.reservation_id,
                        reservation_code: event.data.reservation_code,
                        day: event.data.day,
                        start_time: event.data.start_time,
                        end_time: event.data.end_time,
                        guests_number: event.data.guests_number,
                        email: event.data.email,
                    })
                        .onConflict('reservation_id')
                        .merge(['reservation_code', 'day', 'start_time', 'end_time', 'guests_number', 'email'])
                        .toQuery())];
            case 'ReservationCancelledByGuest':
                return [(0, dumbo_1.sql)(db(exports.tableName)
                        .withSchema('public')
                        .where({ reservation_id: event.data.reservation_id })
                        .delete()
                        .toQuery())];
            default:
                return [];
        }
    }),
});

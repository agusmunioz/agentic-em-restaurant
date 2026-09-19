import {postgreSQLRawSQLProjection} from '@event-driven-io/emmett-postgresql';
import {sql, SQL} from '@event-driven-io/dumbo';
import knex, {Knex} from 'knex';
import {type ReservationPlaced, type ReservationCancelledByGuest} from '../TableReservationEvents';

export const tableName = 'guest_active_reservations';

export type GuestActiveReservationsReadModel = {
    reservation_id: string;
    reservation_code: string;
    day: string;
    start_time: string;
    end_time: string;
    guests_number: number;
    email: string;
};

export const getKnexInstance = (): Knex => knex({client: 'pg'});

type GuestActiveReservationsEvents = ReservationPlaced | ReservationCancelledByGuest;

export const GuestActiveReservationsProjection = postgreSQLRawSQLProjection<GuestActiveReservationsEvents>({
    name: 'GuestActiveReservationsProjection',
    canHandle: ['ReservationPlaced', 'ReservationCancelledByGuest'],
    evolve: async (event): Promise<SQL[]> => {
        const db = getKnexInstance();

        switch (event.type) {
            case 'ReservationPlaced':
                return [sql(db(tableName)
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
                return [sql(db(tableName)
                    .withSchema('public')
                    .where({reservation_id: event.data.reservation_id})
                    .delete()
                    .toQuery())];

            default:
                return [];
        }
    },
});

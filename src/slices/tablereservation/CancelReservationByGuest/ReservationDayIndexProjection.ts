import {postgreSQLRawSQLProjection} from '@event-driven-io/emmett-postgresql';
import {sql, SQL} from '@event-driven-io/dumbo';
import knex, {Knex} from 'knex';
import {type ReservationPlaced} from '../TableReservationEvents';

// PlaceReservation's stream is keyed by day (`table-reservation-${day}`), not by
// reservation_id, so cancelling by reservation_id alone needs a way to find the
// stream to append to. This table maps reservation_id -> day and is never deleted
// on cancellation, so a repeat-cancel can still be routed to the right stream and
// correctly rejected as "already cancelled" rather than "not found".
export const tableName = 'reservation_day_index';

export const getKnexInstance = (): Knex => knex({client: 'pg'});

type ReservationDayIndexEvents = ReservationPlaced;

export const ReservationDayIndexProjection = postgreSQLRawSQLProjection<ReservationDayIndexEvents>({
    name: 'ReservationDayIndexProjection',
    canHandle: ['ReservationPlaced'],
    evolve: async (event): Promise<SQL[]> => {
        const db = getKnexInstance();

        switch (event.type) {
            case 'ReservationPlaced':
                return [sql(db(tableName)
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
    },
});

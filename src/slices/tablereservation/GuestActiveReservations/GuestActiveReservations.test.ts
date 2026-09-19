import {before, after, describe, it} from 'node:test';
import {PostgreSQLProjectionAssert, PostgreSQLProjectionSpec} from '@event-driven-io/emmett-postgresql';
import {GuestActiveReservationsProjection} from './GuestActiveReservationsProjection';
import {PostgreSqlContainer, StartedPostgreSqlContainer} from '@testcontainers/postgresql';
import knex, {Knex} from 'knex';
import assert from 'assert';
import {runFlywayMigrations} from '../../../common/testHelpers';

const RESERVATION_ID = '1232-ASD-123';

describe('Guest Active Reservations Specification', () => {
    let postgres: StartedPostgreSqlContainer;
    let connectionString: string;
    let db: Knex;
    let given: PostgreSQLProjectionSpec<any>;

    before(async () => {
        postgres = await new PostgreSqlContainer('postgres').start();
        connectionString = postgres.getConnectionUri();

        db = knex({client: 'pg', connection: connectionString});

        await runFlywayMigrations(connectionString);

        given = PostgreSQLProjectionSpec.for({
            projection: GuestActiveReservationsProjection,
            connectionString,
        });
    });

    after(async () => {
        await db?.destroy();
        await postgres?.stop();
    });

    it('spec: Guest active reservations are listed', async () => {
        const assertReadModel: PostgreSQLProjectionAssert = async ({connectionString: connStr}) => {
            const queryDb = knex({client: 'pg', connection: connStr});
            try {
                const result = await queryDb('guest_active_reservations')
                    .withSchema('public')
                    .where({reservation_id: RESERVATION_ID})
                    .first();

                assert.ok(result, 'row should exist');
                assert.strictEqual(result.reservation_code, '12ZD3C');
                assert.strictEqual(result.start_time, '11:00');
                assert.strictEqual(result.end_time, '13:00');
                assert.strictEqual(result.guests_number, 4);
                assert.strictEqual(result.email, 'hey@email.com');
            } finally {
                await queryDb.destroy();
            }
        };

        await given([{
            type: 'ReservationPlaced',
            data: {
                reservation_id: RESERVATION_ID,
                reservation_code: '12ZD3C',
                email: 'hey@email.com',
                day: '20206-10-12',
                start_time: '11:00',
                end_time: '13:00',
                guests_number: 4,
            },
            metadata: {stream_name: `table-reservation-20206-10-12`},
        }])
            .when([])
            .then(assertReadModel);
    });

    it('spec: Guest Active Reservations - cancelled reservation is delisted', async () => {
        const assertReadModel: PostgreSQLProjectionAssert = async ({connectionString: connStr}) => {
            const queryDb = knex({client: 'pg', connection: connStr});
            try {
                const result = await queryDb('guest_active_reservations')
                    .withSchema('public')
                    .where({reservation_id: RESERVATION_ID})
                    .first();

                assert.strictEqual(result, undefined, 'row should be deleted');
            } finally {
                await queryDb.destroy();
            }
        };

        await given([
            {
                type: 'ReservationPlaced',
                data: {
                    reservation_id: RESERVATION_ID,
                    reservation_code: '12ZD3C',
                    email: 'hey@email.com',
                    day: '20206-10-12',
                    start_time: '11:00',
                    end_time: '13:00',
                    guests_number: 4,
                },
                metadata: {stream_name: `table-reservation-20206-10-12`},
            },
            {
                type: 'ReservationCancelledByGuest',
                data: {reservation_id: RESERVATION_ID},
                metadata: {stream_name: `table-reservation-20206-10-12`},
            },
        ])
            .when([])
            .then(assertReadModel);
    });
});

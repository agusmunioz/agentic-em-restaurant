import {DeciderSpecification} from '@event-driven-io/emmett';
import {
    AddTableCommand,
    AddTableInitialState,
    decide,
    evolve,
    isTableNumberTaken,
} from './AddTableCommand';
import {before, after, describe, it} from 'node:test';
import assert from 'assert';
import {PostgreSqlContainer, StartedPostgreSqlContainer} from '@testcontainers/postgresql';
import knex, {Knex} from 'knex';
import {runFlywayMigrations} from '../../../common/testHelpers';

describe('Add Table Specification', () => {
    const given = DeciderSpecification.for({
        decide: (command: AddTableCommand, state: Parameters<typeof evolve>[0]) =>
            decide(command, state, '123-abc'),
        evolve,
        initialState: AddTableInitialState,
    });

    it('spec: Add Table - Add table succesfully', () => {
        const command: AddTableCommand = {
            type: 'AddTable',
            data: {
                table_number: 1,
                seats: 4,
            },
            metadata: {},
        };

        given([])
            .when(command)
            .then([{
                type: 'TableAdded',
                data: {
                    table_id: '123-abc',
                    table_number: 1,
                    seats: 4,
                },
                metadata: {
                    correlation_id: undefined,
                    causation_id: undefined,
                },
            }]);
    });
});

describe('Add Table - table number uniqueness guard', () => {
    let postgres: StartedPostgreSqlContainer;
    let db: Knex;

    before(async () => {
        postgres = await new PostgreSqlContainer('postgres').start();
        const connectionString = postgres.getConnectionUri();
        await runFlywayMigrations(connectionString);
        db = knex({client: 'pg', connection: connectionString});
    });

    after(async () => {
        await db?.destroy();
        await postgres?.stop();
    });

    it('spec: Add Table - Table number is unique', async () => {
        await db('tables').withSchema('public').insert({
            table_id: 'existing-table-id',
            table_number: 1,
            seats: 4,
        });

        assert.strictEqual(await isTableNumberTaken(db, 1), true);
        assert.strictEqual(await isTableNumberTaken(db, 2), false);
    });
});

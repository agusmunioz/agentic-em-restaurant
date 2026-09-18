import {before, after, describe, it} from 'node:test';
import {PostgreSQLProjectionAssert, PostgreSQLProjectionSpec} from '@event-driven-io/emmett-postgresql';
import {ListTablesProjection} from './ListTablesProjection';
import {PostgreSqlContainer, StartedPostgreSqlContainer} from '@testcontainers/postgresql';
import knex, {Knex} from 'knex';
import assert from 'assert';
import {runFlywayMigrations} from '../../../common/testHelpers';

const TABLE_ID = '123-1239-123';

describe('List Tables Specification', () => {
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
            projection: ListTablesProjection,
            connectionString,
        });
    });

    after(async () => {
        await db?.destroy();
        await postgres?.stop();
    });

    describe('Storyline: Added table is listed', () => {
        it('spec: Added table is listed — after TableAdded', async () => {
            const assertReadModel: PostgreSQLProjectionAssert = async ({connectionString: connStr}) => {
                const queryDb = knex({client: 'pg', connection: connStr});
                try {
                    const result = await queryDb('tables')
                        .withSchema('public')
                        .where({table_id: TABLE_ID})
                        .first();

                    assert.ok(result, 'row should exist');
                    assert.strictEqual(result.table_id, TABLE_ID);
                    assert.strictEqual(result.table_number, 1);
                    assert.strictEqual(result.seats, 4);
                } finally {
                    await queryDb.destroy();
                }
            };

            await given([{
                type: 'TableAdded',
                data: {table_id: TABLE_ID, table_number: 1, seats: 4},
                metadata: {stream_name: `table-configuration-${TABLE_ID}`},
            }])
                .when([])
                .then(assertReadModel);
        });
    });

    it('spec: List Tables - removed table is delisted', async () => {
        const assertReadModel: PostgreSQLProjectionAssert = async ({connectionString: connStr}) => {
            const queryDb = knex({client: 'pg', connection: connStr});
            try {
                const result = await queryDb('tables')
                    .withSchema('public')
                    .where({table_id: TABLE_ID})
                    .first();

                assert.strictEqual(result, undefined, 'row should be deleted');
            } finally {
                await queryDb.destroy();
            }
        };

        await given([
            {
                type: 'TableAdded',
                data: {table_id: TABLE_ID, table_number: 1, seats: 4},
                metadata: {stream_name: `table-configuration-${TABLE_ID}`},
            },
            {
                type: 'TableRemoved',
                data: {table_id: TABLE_ID},
                metadata: {stream_name: `table-configuration-${TABLE_ID}`},
            },
        ])
            .when([])
            .then(assertReadModel);
    });
});

import {before, after, describe, it} from 'node:test';
import {PostgreSQLProjectionAssert, PostgreSQLProjectionSpec} from '@event-driven-io/emmett-postgresql';
import {ActiveEmployeesProjection} from './ActiveEmployeesProjection';
import {PostgreSqlContainer, StartedPostgreSqlContainer} from '@testcontainers/postgresql';
import knex, {Knex} from 'knex';
import assert from 'assert';
import {runFlywayMigrations} from '../../../common/testHelpers';

const EMPLOYEE_ID = '231-123AS-das';

describe('List Active Employees Specification', () => {
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
            projection: ActiveEmployeesProjection,
            connectionString,
        });
    });

    after(async () => {
        await db?.destroy();
        await postgres?.stop();
    });

    describe('Storyline: Created employee is listed', () => {
        it('spec: Manager views the list of active employees — after EmployeeCreated', async () => {
            const assertReadModel: PostgreSQLProjectionAssert = async ({connectionString: connStr}) => {
                const queryDb = knex({client: 'pg', connection: connStr});
                try {
                    const result = await queryDb('active_employees')
                        .withSchema('public')
                        .where({employee_id: EMPLOYEE_ID})
                        .first();

                    assert.ok(result, 'row should exist');
                    assert.strictEqual(result.employee_id, EMPLOYEE_ID);
                    assert.strictEqual(result.employee_first_name, 'Tom');
                    assert.strictEqual(result.employee_last_name, 'Becker');
                    assert.strictEqual(result.employee_role, 'cooker');
                } finally {
                    await queryDb.destroy();
                }
            };

            await given([{
                type: 'EmployeeCreated',
                data: {
                    employee_id: EMPLOYEE_ID,
                    employee_first_name: 'Tom',
                    employee_last_name: 'Becker',
                    employee_role: 'cooker',
                },
                metadata: {stream_name: `employee-onboarding-${EMPLOYEE_ID}`},
            }])
                .when([])
                .then(assertReadModel);
        });
    });

    it('spec: List Active Employees - deleted employee is delisted', async () => {
        const assertReadModel: PostgreSQLProjectionAssert = async ({connectionString: connStr}) => {
            const queryDb = knex({client: 'pg', connection: connStr});
            try {
                const result = await queryDb('active_employees')
                    .withSchema('public')
                    .where({employee_id: EMPLOYEE_ID})
                    .first();

                assert.strictEqual(result, undefined, 'row should be deleted');
            } finally {
                await queryDb.destroy();
            }
        };

        await given([
            {
                type: 'EmployeeCreated',
                data: {
                    employee_id: EMPLOYEE_ID,
                    employee_first_name: 'Tom',
                    employee_last_name: 'Becker',
                    employee_role: 'cooker',
                },
                metadata: {stream_name: `employee-onboarding-${EMPLOYEE_ID}`},
            },
            {
                type: 'EmployeeDeleted',
                data: {employee_id: EMPLOYEE_ID},
                metadata: {stream_name: `employee-onboarding-${EMPLOYEE_ID}`},
            },
        ])
            .when([])
            .then(assertReadModel);
    });
});

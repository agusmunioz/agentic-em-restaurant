import {postgreSQLRawSQLProjection} from '@event-driven-io/emmett-postgresql';
import {sql, SQL} from '@event-driven-io/dumbo';
import knex, {Knex} from 'knex';
import {type TableAdded} from '../TableConfigurationEvents';

export const tableName = 'tables';

export type TablesReadModel = {
    table_id: string;
    table_number: number;
    seats: number;
};

export const getKnexInstance = (): Knex => knex({client: 'pg'});

// The "Tables" read model also depends on Table Removed and Table Seats
// Updated per the board's dependency graph, but neither event exists yet —
// the Remove Table / Update Table Seats slices that emit them haven't been
// built, so their data shape isn't specified. Extend canHandle/evolve here
// once those slices define those events.
type ListTablesEvents = TableAdded;

export const ListTablesProjection = postgreSQLRawSQLProjection<ListTablesEvents>({
    name: 'ListTablesProjection',
    canHandle: ['TableAdded'],
    evolve: async (event): Promise<SQL[]> => {
        const db = getKnexInstance();

        switch (event.type) {
            case 'TableAdded':
                return [sql(db(tableName)
                    .withSchema('public')
                    .insert({
                        table_id: event.data.table_id,
                        table_number: event.data.table_number,
                        seats: event.data.seats,
                    })
                    .onConflict('table_id')
                    .merge(['table_number', 'seats'])
                    .toQuery())];

            default:
                return [];
        }
    },
});

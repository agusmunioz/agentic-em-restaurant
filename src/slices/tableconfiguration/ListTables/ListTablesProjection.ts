import {postgreSQLRawSQLProjection} from '@event-driven-io/emmett-postgresql';
import {sql, SQL} from '@event-driven-io/dumbo';
import knex, {Knex} from 'knex';
import {type TableAdded, type TableRemoved, type TableSeatsUpdated} from '../TableConfigurationEvents';

export const tableName = 'tables';

export type TablesReadModel = {
    table_id: string;
    table_number: number;
    seats: number;
};

export const getKnexInstance = (): Knex => knex({client: 'pg'});

type ListTablesEvents = TableAdded | TableRemoved | TableSeatsUpdated;

export const ListTablesProjection = postgreSQLRawSQLProjection<ListTablesEvents>({
    name: 'ListTablesProjection',
    canHandle: ['TableAdded', 'TableRemoved', 'TableSeatsUpdated'],
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

            case 'TableRemoved':
                return [sql(db(tableName)
                    .withSchema('public')
                    .where({table_id: event.data.table_id})
                    .delete()
                    .toQuery())];

            case 'TableSeatsUpdated':
                return [sql(db(tableName)
                    .withSchema('public')
                    .where({table_id: event.data.table_id})
                    .update({seats: event.data.seats})
                    .toQuery())];

            default:
                return [];
        }
    },
});

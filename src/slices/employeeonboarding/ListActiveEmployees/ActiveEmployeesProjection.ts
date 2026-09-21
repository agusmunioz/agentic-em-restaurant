import {postgreSQLRawSQLProjection} from '@event-driven-io/emmett-postgresql';
import {sql, SQL} from '@event-driven-io/dumbo';
import knex, {Knex} from 'knex';
import {type EmployeeCreated, type EmployeeDeleted} from '../EmployeeOnboardingEvents';

export const tableName = 'active_employees';

export type ActiveEmployeesReadModel = {
    employee_id: string;
    employee_first_name: string;
    employee_last_name: string;
    employee_role: string;
};

export const getKnexInstance = (): Knex => knex({client: 'pg'});

type ListActiveEmployeesEvents = EmployeeCreated | EmployeeDeleted;

export const ActiveEmployeesProjection = postgreSQLRawSQLProjection<ListActiveEmployeesEvents>({
    name: 'ActiveEmployeesProjection',
    canHandle: ['EmployeeCreated', 'EmployeeDeleted'],
    evolve: async (event): Promise<SQL[]> => {
        const db = getKnexInstance();

        switch (event.type) {
            case 'EmployeeCreated':
                return [sql(db(tableName)
                    .withSchema('public')
                    .insert({
                        employee_id: event.data.employee_id,
                        employee_first_name: event.data.employee_first_name,
                        employee_last_name: event.data.employee_last_name,
                        employee_role: event.data.employee_role,
                    })
                    .onConflict('employee_id')
                    .merge(['employee_first_name', 'employee_last_name', 'employee_role'])
                    .toQuery())];

            case 'EmployeeDeleted':
                return [sql(db(tableName)
                    .withSchema('public')
                    .where({employee_id: event.data.employee_id})
                    .delete()
                    .toQuery())];

            default:
                return [];
        }
    },
});

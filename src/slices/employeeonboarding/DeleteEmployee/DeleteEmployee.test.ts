import {DeciderSpecification} from '@event-driven-io/emmett';
import {
    DeleteEmployeeCommand,
    DeleteEmployeeInitialState,
    decide,
    evolve,
} from './DeleteEmployeeCommand';
import {describe, it} from 'node:test';

describe('Delete Employee Specification', () => {
    const given = DeciderSpecification.for({
        decide,
        evolve,
        initialState: DeleteEmployeeInitialState,
    });

    it('spec: Delete Employee - Manager deletes an existing employee', () => {
        const command: DeleteEmployeeCommand = {
            type: 'DeleteEmployee',
            data: {
                employee_id: '231-123AS-das',
            },
            metadata: {},
        };

        given([{
            type: 'EmployeeCreated',
            data: {
                employee_id: '231-123AS-das',
                employee_first_name: 'Tom',
                employee_last_name: 'Becker',
                employee_role: 'cooker',
            },
            metadata: {},
        }])
            .when(command)
            .then([{
                type: 'EmployeeDeleted',
                data: {
                    employee_id: '231-123AS-das',
                },
                metadata: {
                    correlation_id: undefined,
                    causation_id: undefined,
                },
            }]);
    });

    it('spec: Delete Employee - Delete employee fails when already deleted', () => {
        const command: DeleteEmployeeCommand = {
            type: 'DeleteEmployee',
            data: {
                employee_id: '231-123AS-das',
            },
            metadata: {},
        };

        given([
            {
                type: 'EmployeeCreated',
                data: {
                    employee_id: '231-123AS-das',
                    employee_first_name: 'Tom',
                    employee_last_name: 'Becker',
                    employee_role: 'cooker',
                },
                metadata: {},
            },
            {
                type: 'EmployeeDeleted',
                data: {employee_id: '231-123AS-das'},
                metadata: {},
            },
        ])
            .when(command)
            .thenThrows();
    });

    it('spec: Delete Employee - Delete employee fails without an employee id', () => {
        const command: DeleteEmployeeCommand = {
            type: 'DeleteEmployee',
            data: {
                employee_id: '',
            },
            metadata: {},
        };

        given([{
            type: 'EmployeeCreated',
            data: {
                employee_id: '231-123AS-das',
                employee_first_name: 'Tom',
                employee_last_name: 'Becker',
                employee_role: 'cooker',
            },
            metadata: {},
        }])
            .when(command)
            .thenThrows();
    });
});

import {DeciderSpecification} from '@event-driven-io/emmett';
import {
    CreateEmployeeCommand,
    CreateEmployeeInitialState,
    decide,
    evolve,
} from './CreateEmployeeCommand';
import {describe, it} from 'node:test';

describe('Create Employee Specification', () => {
    const given = DeciderSpecification.for({
        decide: (command: CreateEmployeeCommand, state: Parameters<typeof evolve>[0]) =>
            decide(command, state, '123-abc'),
        evolve,
        initialState: CreateEmployeeInitialState,
    });

    it('spec: Create Employee - Manager creates a new employee', () => {
        const command: CreateEmployeeCommand = {
            type: 'CreateEmployee',
            data: {
                employee_first_name: 'Tom',
                employee_last_name: 'Becker',
                employee_role: 'cooker',
            },
            metadata: {},
        };

        given([])
            .when(command)
            .then([{
                type: 'EmployeeCreated',
                data: {
                    employee_id: '123-abc',
                    employee_first_name: 'Tom',
                    employee_last_name: 'Becker',
                    employee_role: 'cooker',
                },
                metadata: {
                    correlation_id: undefined,
                    causation_id: undefined,
                },
            }]);
    });

    it('spec: Create Employee - Create employee fails without a first name', () => {
        const command: CreateEmployeeCommand = {
            type: 'CreateEmployee',
            data: {
                employee_first_name: '',
                employee_last_name: 'Becker',
                employee_role: 'cooker',
            },
            metadata: {},
        };

        given([])
            .when(command)
            .thenThrows();
    });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emmett_1 = require("@event-driven-io/emmett");
const CreateEmployeeCommand_1 = require("./CreateEmployeeCommand");
const node_test_1 = require("node:test");
(0, node_test_1.describe)('Create Employee Specification', () => {
    const given = emmett_1.DeciderSpecification.for({
        decide: (command, state) => (0, CreateEmployeeCommand_1.decide)(command, state, '123-abc'),
        evolve: CreateEmployeeCommand_1.evolve,
        initialState: CreateEmployeeCommand_1.CreateEmployeeInitialState,
    });
    (0, node_test_1.it)('spec: Create Employee - Manager creates a new employee', () => {
        const command = {
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
    (0, node_test_1.it)('spec: Create Employee - Create employee fails without a first name', () => {
        const command = {
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

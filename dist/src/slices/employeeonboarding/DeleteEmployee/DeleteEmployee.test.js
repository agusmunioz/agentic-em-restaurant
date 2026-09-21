"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emmett_1 = require("@event-driven-io/emmett");
const DeleteEmployeeCommand_1 = require("./DeleteEmployeeCommand");
const node_test_1 = require("node:test");
(0, node_test_1.describe)('Delete Employee Specification', () => {
    const given = emmett_1.DeciderSpecification.for({
        decide: DeleteEmployeeCommand_1.decide,
        evolve: DeleteEmployeeCommand_1.evolve,
        initialState: DeleteEmployeeCommand_1.DeleteEmployeeInitialState,
    });
    (0, node_test_1.it)('spec: Delete Employee - Manager deletes an existing employee', () => {
        const command = {
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
    (0, node_test_1.it)('spec: Delete Employee - Delete employee fails when already deleted', () => {
        const command = {
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
                data: { employee_id: '231-123AS-das' },
                metadata: {},
            },
        ])
            .when(command)
            .thenThrows();
    });
    (0, node_test_1.it)('spec: Delete Employee - Delete employee fails without an employee id', () => {
        const command = {
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emmett_1 = require("@event-driven-io/emmett");
const RemoveTableCommand_1 = require("./RemoveTableCommand");
const node_test_1 = require("node:test");
(0, node_test_1.describe)('Remove Table Specification', () => {
    const given = emmett_1.DeciderSpecification.for({
        decide: RemoveTableCommand_1.decide,
        evolve: RemoveTableCommand_1.evolve,
        initialState: RemoveTableCommand_1.RemoveTableInitialState,
    });
    (0, node_test_1.it)('spec: Remove Table - Remove table successfully', () => {
        const command = {
            type: 'RemoveTable',
            data: {
                table_id: '123-abc',
            },
            metadata: {},
        };
        given([{
                type: 'TableAdded',
                data: {
                    table_id: '123-abc',
                    table_number: 1,
                    seats: 2,
                },
                metadata: {},
            }])
            .when(command)
            .then([{
                type: 'TableRemoved',
                data: {
                    table_id: '123-abc',
                },
                metadata: {
                    correlation_id: undefined,
                    causation_id: undefined,
                },
            }]);
    });
    (0, node_test_1.it)('spec: Remove Table - Remove non existing table fails', () => {
        const command = {
            type: 'RemoveTable',
            data: {
                table_id: '99999',
            },
            metadata: {},
        };
        given([])
            .when(command)
            .thenThrows();
    });
});

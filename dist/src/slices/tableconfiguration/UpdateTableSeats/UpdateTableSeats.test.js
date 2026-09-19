"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emmett_1 = require("@event-driven-io/emmett");
const UpdateTableSeatsCommand_1 = require("./UpdateTableSeatsCommand");
const node_test_1 = require("node:test");
(0, node_test_1.describe)('Update Table Seats Specification', () => {
    const given = emmett_1.DeciderSpecification.for({
        decide: UpdateTableSeatsCommand_1.decide,
        evolve: UpdateTableSeatsCommand_1.evolve,
        initialState: UpdateTableSeatsCommand_1.UpdateTableSeatsInitialState,
    });
    (0, node_test_1.it)('spec: Update Table Seats - Update table seat succesfully', () => {
        const command = {
            type: 'UpdateTableSeats',
            data: {
                table_id: '123-abc',
                seats: 6,
            },
            metadata: {},
        };
        given([{
                type: 'TableAdded',
                data: {
                    table_id: '123-abc',
                    table_number: 1,
                    seats: 4,
                },
                metadata: {},
            }])
            .when(command)
            .then([{
                type: 'TableSeatsUpdated',
                data: {
                    table_id: '123-abc',
                    seats: 6,
                },
                metadata: {
                    correlation_id: undefined,
                    causation_id: undefined,
                },
            }]);
    });
});

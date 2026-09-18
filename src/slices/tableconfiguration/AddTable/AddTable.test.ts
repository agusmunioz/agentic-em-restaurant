import {DeciderSpecification} from '@event-driven-io/emmett';
import {
    AddTableCommand,
    AddTableInitialState,
    decide,
    evolve,
} from './AddTableCommand';
import {describe, it} from 'node:test';

describe('Add Table Specification', () => {
    const given = DeciderSpecification.for({
        decide,
        evolve,
        initialState: AddTableInitialState,
    });

    const givenWithFixedId = DeciderSpecification.for({
        decide: (command: AddTableCommand, state: Parameters<typeof evolve>[0]) =>
            decide(command, state, () => '123-ASD-123x'),
        evolve,
        initialState: AddTableInitialState,
    });

    it('spec: Add Table - Add table succesfully', () => {
        const command: AddTableCommand = {
            type: 'AddTable',
            data: {
                table_number: 1,
                seats: 4,
            },
            metadata: {},
        };

        givenWithFixedId([])
            .when(command)
            .then([{
                type: 'TableAdded',
                data: {
                    table_id: '123-ASD-123x',
                    table_number: 1,
                    seats: 4,
                },
                metadata: {
                    correlation_id: undefined,
                    causation_id: undefined,
                },
            }]);
    });

    it('spec: Add Table - Table number is unique', () => {
        const command: AddTableCommand = {
            type: 'AddTable',
            data: {
                table_number: 1,
                seats: 8,
            },
            metadata: {},
        };

        given([{
            type: 'TableAdded',
            data: {
                table_id: '213-123-324dqwa',
                table_number: 1,
                seats: 4,
            },
            metadata: {},
        }])
            .when(command)
            .thenThrows();
    });

    it('spec: Add Table - Seats must be bigger than zero', () => {
        const command: AddTableCommand = {
            type: 'AddTable',
            data: {
                table_number: 1,
                seats: 0,
            },
            metadata: {},
        };

        given([])
            .when(command)
            .thenThrows();
    });
});

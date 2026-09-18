import {DeciderSpecification} from '@event-driven-io/emmett';
import {
    UpdateTableSeatsCommand,
    UpdateTableSeatsInitialState,
    decide,
    evolve,
} from './UpdateTableSeatsCommand';
import {describe, it} from 'node:test';

describe('Update Table Seats Specification', () => {
    const given = DeciderSpecification.for({
        decide,
        evolve,
        initialState: UpdateTableSeatsInitialState,
    });

    it('spec: Update Table Seats - Update table seat succesfully', () => {
        const command: UpdateTableSeatsCommand = {
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

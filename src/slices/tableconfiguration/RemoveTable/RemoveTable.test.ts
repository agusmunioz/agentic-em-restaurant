import {DeciderSpecification} from '@event-driven-io/emmett';
import {
    RemoveTableCommand,
    RemoveTableInitialState,
    decide,
    evolve,
} from './RemoveTableCommand';
import {describe, it} from 'node:test';

describe('Remove Table Specification', () => {
    const given = DeciderSpecification.for({
        decide,
        evolve,
        initialState: RemoveTableInitialState,
    });

    it('spec: Remove Table - Remove table successfully', () => {
        const command: RemoveTableCommand = {
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

    it('spec: Remove Table - Remove non existing table fails', () => {
        const command: RemoveTableCommand = {
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

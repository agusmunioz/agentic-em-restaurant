import type {Command} from '@event-driven-io/emmett';
import {CommandHandler} from '@event-driven-io/emmett';
import {randomUUID} from 'crypto';
import {type TableConfigurationEvents} from '../TableConfigurationEvents';
import {findEventstore} from '../../../common/loadPostgresEventstore';

export type AddTableCommand = Command<'AddTable', {
    table_number: number;
    seats: number;
}, {
    correlation_id?: string;
    causation_id?: string;
}>;

export type AddTableState = {
    exists: boolean;
};

export const AddTableInitialState = (): AddTableState => ({
    exists: false,
});

export const evolve = (
    state: AddTableState,
    event: TableConfigurationEvents,
): AddTableState => {
    const {type} = event;

    switch (type) {
        case 'TableAdded':
            return {exists: true};
        default:
            return state;
    }
};

const generateTableId = (): string => randomUUID();

export const decide = (
    command: AddTableCommand,
    state: AddTableState,
    generateId: () => string = generateTableId,
): TableConfigurationEvents[] => {
    if (state.exists) {
        throw {code: 'table_number_not_unique', message: 'A table with the same number already exists'};
    }

    if (command.data.seats <= 0) {
        throw {code: 'seats_not_positive', message: 'Seats must be bigger than zero'};
    }

    return [{
        type: 'TableAdded',
        data: {
            table_id: generateId(),
            table_number: command.data.table_number,
            seats: command.data.seats,
        },
        metadata: {
            correlation_id: command.metadata?.correlation_id,
            causation_id: command.metadata?.causation_id,
        },
    }];
};

const AddTableCommandHandler = CommandHandler<AddTableState, TableConfigurationEvents>({
    evolve,
    initialState: AddTableInitialState,
});

export const handleAddTable = async (command: AddTableCommand) => {
    const eventStore = await findEventstore();
    const streamId = `table-configuration-${command.data.table_number}`;
    const result = await AddTableCommandHandler(
        eventStore,
        streamId,
        (state: AddTableState) => decide(command, state),
    );
    return {
        nextExpectedStreamVersion: result.nextExpectedStreamVersion,
        lastEventGlobalPosition: result.lastEventGlobalPosition,
        newEvents: result.newEvents,
    };
};

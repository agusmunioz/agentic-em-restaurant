import type {Command} from '@event-driven-io/emmett';
import {CommandHandler} from '@event-driven-io/emmett';
import {type TableConfigurationEvents} from '../TableConfigurationEvents';
import {findEventstore} from '../../../common/loadPostgresEventstore';

export type RemoveTableCommand = Command<'RemoveTable', {
    table_id: string;
}, {
    correlation_id?: string;
    causation_id?: string;
}>;

export type RemoveTableState = {
    exists: boolean;
};

export const RemoveTableInitialState = (): RemoveTableState => ({
    exists: false,
});

export const evolve = (
    state: RemoveTableState,
    event: TableConfigurationEvents,
): RemoveTableState => {
    const {type} = event;

    switch (type) {
        case 'TableAdded':
            return {exists: true};
        case 'TableRemoved':
            return {exists: false};
        default:
            return state;
    }
};

export const decide = (
    command: RemoveTableCommand,
    state: RemoveTableState,
): TableConfigurationEvents[] => {
    if (!state.exists) {
        throw {code: 'table_not_found', message: 'Unable to remove non existing table'};
    }

    return [{
        type: 'TableRemoved',
        data: {
            table_id: command.data.table_id,
        },
        metadata: {
            correlation_id: command.metadata?.correlation_id,
            causation_id: command.metadata?.causation_id,
        },
    }];
};

const RemoveTableCommandHandler = CommandHandler<RemoveTableState, TableConfigurationEvents>({
    evolve,
    initialState: RemoveTableInitialState,
});

export const handleRemoveTable = async (command: RemoveTableCommand) => {
    const eventStore = await findEventstore();
    const streamId = `table-configuration-${command.data.table_id}`;
    const result = await RemoveTableCommandHandler(
        eventStore,
        streamId,
        (state: RemoveTableState) => decide(command, state),
    );
    return {
        nextExpectedStreamVersion: result.nextExpectedStreamVersion,
        lastEventGlobalPosition: result.lastEventGlobalPosition,
        newEvents: result.newEvents,
    };
};

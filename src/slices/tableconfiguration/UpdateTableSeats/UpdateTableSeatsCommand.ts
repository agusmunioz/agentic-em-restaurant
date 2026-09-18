import type {Command} from '@event-driven-io/emmett';
import {CommandHandler} from '@event-driven-io/emmett';
import {type TableConfigurationEvents} from '../TableConfigurationEvents';
import {findEventstore} from '../../../common/loadPostgresEventstore';

export type UpdateTableSeatsCommand = Command<'UpdateTableSeats', {
    table_id: string;
    seats: number;
}, {
    correlation_id?: string;
    causation_id?: string;
}>;

export type UpdateTableSeatsState = Record<string, never>;

export const UpdateTableSeatsInitialState = (): UpdateTableSeatsState => ({});

export const evolve = (
    state: UpdateTableSeatsState,
    _event: TableConfigurationEvents,
): UpdateTableSeatsState => state;

export const decide = (
    command: UpdateTableSeatsCommand,
    _state: UpdateTableSeatsState,
): TableConfigurationEvents[] => {
    return [{
        type: 'TableSeatsUpdated',
        data: {
            table_id: command.data.table_id,
            seats: command.data.seats,
        },
        metadata: {
            correlation_id: command.metadata?.correlation_id,
            causation_id: command.metadata?.causation_id,
        },
    }];
};

const UpdateTableSeatsCommandHandler = CommandHandler<UpdateTableSeatsState, TableConfigurationEvents>({
    evolve,
    initialState: UpdateTableSeatsInitialState,
});

export const handleUpdateTableSeats = async (command: UpdateTableSeatsCommand) => {
    const eventStore = await findEventstore();
    const streamId = `table-configuration-${command.data.table_id}`;
    const result = await UpdateTableSeatsCommandHandler(
        eventStore,
        streamId,
        (state: UpdateTableSeatsState) => decide(command, state),
    );
    return {
        nextExpectedStreamVersion: result.nextExpectedStreamVersion,
        lastEventGlobalPosition: result.lastEventGlobalPosition,
        newEvents: result.newEvents,
    };
};

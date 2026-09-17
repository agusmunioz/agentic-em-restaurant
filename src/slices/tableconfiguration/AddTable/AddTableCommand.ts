import type {Command} from '@event-driven-io/emmett';
import {CommandHandler} from '@event-driven-io/emmett';
import {randomUUID} from 'crypto';
import type {Knex} from 'knex';
import {type TableConfigurationEvents} from '../TableConfigurationEvents';
import {findEventstore} from '../../../common/loadPostgresEventstore';
import {getKnexInstance} from '../../../common/db';

export type AddTableCommand = Command<'AddTable', {
    table_number: number;
    seats: number;
}, {
    correlation_id?: string;
    causation_id?: string;
}>;

export type AddTableState = Record<string, never>;

export const AddTableInitialState = (): AddTableState => ({});

export const evolve = (
    state: AddTableState,
    _event: TableConfigurationEvents,
): AddTableState => state;

const generateTableId = (): string => randomUUID();

// The table aggregate is identified by table_id (its stream key), generated
// before deciding so it's available to both the event and the stream id.
// table_number uniqueness can't be checked via single-stream replay against
// a fresh, never-before-used table_id stream, so it's enforced separately —
// see isTableNumberTaken, checked against the Tables read model before this
// runs.
export const decide = (
    command: AddTableCommand,
    _state: AddTableState,
    tableId: string = generateTableId(),
): TableConfigurationEvents[] => {
    return [{
        type: 'TableAdded',
        data: {
            table_id: tableId,
            table_number: command.data.table_number,
            seats: command.data.seats,
        },
        metadata: {
            correlation_id: command.metadata?.correlation_id,
            causation_id: command.metadata?.causation_id,
        },
    }];
};

export const isTableNumberTaken = async (db: Knex, tableNumber: number): Promise<boolean> => {
    const existing = await db('tables')
        .withSchema('public')
        .where({table_number: tableNumber})
        .first();
    return existing !== undefined;
};

const AddTableCommandHandler = CommandHandler<AddTableState, TableConfigurationEvents>({
    evolve,
    initialState: AddTableInitialState,
});

export const handleAddTable = async (command: AddTableCommand) => {
    if (await isTableNumberTaken(getKnexInstance(), command.data.table_number)) {
        throw {code: 'table_number_not_unique', message: 'A table with the same number already exists'};
    }

    const eventStore = await findEventstore();
    const tableId = generateTableId();
    const streamId = `table-configuration-${tableId}`;
    const result = await AddTableCommandHandler(
        eventStore,
        streamId,
        (state: AddTableState) => decide(command, state, tableId),
    );
    return {
        nextExpectedStreamVersion: result.nextExpectedStreamVersion,
        lastEventGlobalPosition: result.lastEventGlobalPosition,
        newEvents: result.newEvents,
    };
};

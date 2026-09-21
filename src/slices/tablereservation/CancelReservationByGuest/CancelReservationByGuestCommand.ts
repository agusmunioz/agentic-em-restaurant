import type {Command} from '@event-driven-io/emmett';
import {CommandHandler} from '@event-driven-io/emmett';
import {type TableReservationEvents} from '../TableReservationEvents';
import {findEventstore} from '../../../common/loadPostgresEventstore';
import {getKnexInstance} from '../../../common/db';
import {tableName as reservationDayIndexTable} from './ReservationDayIndexProjection';

export type CancelReservationByGuestCommand = Command<'CancelReservationByGuest', {
    reservation_id: string;
}, {
    correlation_id?: string;
    causation_id?: string;
}>;

type ReservationEntry = {
    cancelled: boolean;
};

export type CancelReservationByGuestState = {
    reservations: Record<string, ReservationEntry>;
};

export const CancelReservationByGuestInitialState = (): CancelReservationByGuestState => ({
    reservations: {},
});

export const evolve = (
    state: CancelReservationByGuestState,
    event: TableReservationEvents,
): CancelReservationByGuestState => {
    const {type} = event;

    switch (type) {
        case 'ReservationPlaced':
            return {
                reservations: {
                    ...state.reservations,
                    [event.data.reservation_id]: {cancelled: false},
                },
            };
        case 'ReservationCancelledByGuest':
            return {
                reservations: {
                    ...state.reservations,
                    [event.data.reservation_id]: {cancelled: true},
                },
            };
        default:
            return state;
    }
};

export const decide = (
    command: CancelReservationByGuestCommand,
    state: CancelReservationByGuestState,
): TableReservationEvents[] => {
    const entry = state.reservations[command.data.reservation_id];

    if (!entry) {
        throw {code: 'reservation_not_found', message: 'Cannot cancel a non existing reservation'};
    }

    if (entry.cancelled) {
        throw {code: 'reservation_already_cancelled', message: 'Cancelling a canceled reservation is not allowed'};
    }

    return [{
        type: 'ReservationCancelledByGuest',
        data: {
            reservation_id: command.data.reservation_id,
        },
        metadata: {
            correlation_id: command.metadata?.correlation_id,
            causation_id: command.metadata?.causation_id,
        },
    }];
};

const CancelReservationByGuestCommandHandler = CommandHandler<CancelReservationByGuestState, TableReservationEvents>({
    evolve,
    initialState: CancelReservationByGuestInitialState,
});

export const handleCancelReservationByGuest = async (command: CancelReservationByGuestCommand) => {
    const db = getKnexInstance();
    const indexRow: {day: string} | undefined = await db(reservationDayIndexTable)
        .withSchema('public')
        .where({reservation_id: command.data.reservation_id})
        .first();

    if (!indexRow) {
        throw {code: 'reservation_not_found', message: 'Cannot cancel a non existing reservation'};
    }

    const eventStore = await findEventstore();
    const streamId = `table-reservation-${indexRow.day}`;
    const result = await CancelReservationByGuestCommandHandler(
        eventStore,
        streamId,
        (state: CancelReservationByGuestState) => decide(command, state),
    );
    return {
        nextExpectedStreamVersion: result.nextExpectedStreamVersion,
        lastEventGlobalPosition: result.lastEventGlobalPosition,
        newEvents: result.newEvents,
    };
};

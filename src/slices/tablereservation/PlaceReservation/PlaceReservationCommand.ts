import type {Command} from '@event-driven-io/emmett';
import {CommandHandler} from '@event-driven-io/emmett';
import {type TableReservationEvents} from '../TableReservationEvents';
import {findEventstore} from '../../../common/loadPostgresEventstore';

export type PlaceReservationCommand = Command<'PlaceReservation', {
    email: string;
    day: string;
    start_time: string;
    end_time: string;
    guests_number: number;
}, {
    correlation_id?: string;
    causation_id?: string;
}>;

type ExistingReservation = {
    start_time: string;
    end_time: string;
};

export type PlaceReservationState = {
    reservations: ExistingReservation[];
};

export const PlaceReservationInitialState = (): PlaceReservationState => ({
    reservations: [],
});

export const evolve = (
    state: PlaceReservationState,
    event: TableReservationEvents,
): PlaceReservationState => {
    const {type} = event;

    switch (type) {
        case 'ReservationPlaced':
            return {
                reservations: [
                    ...state.reservations,
                    {start_time: event.data.start_time, end_time: event.data.end_time},
                ],
            };
        default:
            return state;
    }
};

const CODE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const generateReservationCode = (): string => {
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += CODE_CHARACTERS[Math.floor(Math.random() * CODE_CHARACTERS.length)];
    }
    return code;
};

const toMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const isInThePast = (day: string): boolean => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [year, month, date] = day.split('-').map(Number);
    const reservationDay = new Date(year, month - 1, date);

    return reservationDay < startOfToday;
};

export const decide = (
    command: PlaceReservationCommand,
    state: PlaceReservationState,
    generateCode: () => string = generateReservationCode,
): TableReservationEvents[] => {
    const {email, day, start_time, end_time, guests_number} = command.data;

    if (guests_number <= 0) {
        throw {code: 'invalid_guests_number', message: 'Guest number must be positive'};
    }

    const startMinutes = toMinutes(start_time);
    const endMinutes = toMinutes(end_time);

    if (startMinutes >= endMinutes) {
        throw {code: 'invalid_time_range', message: 'Start time cannot be after end time'};
    }

    if (isInThePast(day)) {
        throw {code: 'reservation_in_the_past', message: 'A reservation in the past is not allowed'};
    }

    const overlaps = state.reservations.some((reservation) => {
        const existingStart = toMinutes(reservation.start_time);
        const existingEnd = toMinutes(reservation.end_time);
        return startMinutes < existingEnd && existingStart < endMinutes;
    });

    if (overlaps) {
        throw {code: 'reservation_overlap', message: 'Table is already reserved at the moment'};
    }

    return [{
        type: 'ReservationPlaced',
        data: {
            reservation_code: generateCode(),
            email,
            day,
            start_time,
            end_time,
            guests_number,
        },
        metadata: {
            correlation_id: command.metadata?.correlation_id,
            causation_id: command.metadata?.causation_id,
        },
    }];
};

const PlaceReservationCommandHandler = CommandHandler<PlaceReservationState, TableReservationEvents>({
    evolve,
    initialState: PlaceReservationInitialState,
});

export const handlePlaceReservation = async (command: PlaceReservationCommand) => {
    const eventStore = await findEventstore();
    const streamId = `table-reservation-${command.data.day}`;
    const result = await PlaceReservationCommandHandler(
        eventStore,
        streamId,
        (state: PlaceReservationState) => decide(command, state),
    );
    return {
        nextExpectedStreamVersion: result.nextExpectedStreamVersion,
        lastEventGlobalPosition: result.lastEventGlobalPosition,
        newEvents: result.newEvents,
    };
};

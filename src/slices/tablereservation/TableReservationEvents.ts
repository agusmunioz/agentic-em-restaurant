import type {Event} from '@event-driven-io/emmett';

type CommonMeta = {
    stream_name?: string;
    userId?: string;
    correlation_id?: string;
    causation_id?: string;
};

export type ReservationPlaced = Event<'ReservationPlaced', {
    reservation_id: string;
    reservation_code: string;
    email: string;
    day: string;
    start_time: string;
    end_time: string;
    guests_number: number;
}, CommonMeta>;

export type TableReservationEvents = ReservationPlaced;

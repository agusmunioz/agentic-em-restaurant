import type {Event} from '@event-driven-io/emmett';

type CommonMeta = {
    stream_name?: string;
    userId?: string;
    correlation_id?: string;
    causation_id?: string;
};

export type TableAdded = Event<'TableAdded', {
    table_id: string;
    table_number: number;
    seats: number;
}, CommonMeta>;

export type TableRemoved = Event<'TableRemoved', {
    table_id: string;
}, CommonMeta>;

export type TableConfigurationEvents = TableAdded | TableRemoved;

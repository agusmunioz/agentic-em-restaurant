import type {Event} from '@event-driven-io/emmett';

type CommonMeta = {
    stream_name?: string;
    userId?: string;
    correlation_id?: string;
    causation_id?: string;
};

export type EmployeeCreated = Event<'EmployeeCreated', {
    employee_id: string;
    employee_first_name: string;
    employee_last_name: string;
    employee_role: string;
}, CommonMeta>;

export type EmployeeDeleted = Event<'EmployeeDeleted', {
    employee_id: string;
}, CommonMeta>;

export type EmployeeOnboardingEvents = EmployeeCreated | EmployeeDeleted;

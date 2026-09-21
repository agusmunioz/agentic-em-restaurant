import type {Command} from '@event-driven-io/emmett';
import {CommandHandler} from '@event-driven-io/emmett';
import {randomUUID} from 'crypto';
import {type EmployeeOnboardingEvents} from '../EmployeeOnboardingEvents';
import {findEventstore} from '../../../common/loadPostgresEventstore';

export type CreateEmployeeCommand = Command<'CreateEmployee', {
    employee_first_name: string;
    employee_last_name: string;
    employee_role: string;
}, {
    correlation_id?: string;
    causation_id?: string;
}>;

export type CreateEmployeeState = Record<string, never>;

export const CreateEmployeeInitialState = (): CreateEmployeeState => ({});

export const evolve = (
    state: CreateEmployeeState,
    _event: EmployeeOnboardingEvents,
): CreateEmployeeState => state;

const generateEmployeeId = (): string => randomUUID();

export const decide = (
    command: CreateEmployeeCommand,
    _state: CreateEmployeeState,
    employeeId: string = generateEmployeeId(),
): EmployeeOnboardingEvents[] => {
    if (!command.data.employee_first_name) {
        throw {code: 'first_name_required', message: 'First name is required'};
    }

    return [{
        type: 'EmployeeCreated',
        data: {
            employee_id: employeeId,
            employee_first_name: command.data.employee_first_name,
            employee_last_name: command.data.employee_last_name,
            employee_role: command.data.employee_role,
        },
        metadata: {
            correlation_id: command.metadata?.correlation_id,
            causation_id: command.metadata?.causation_id,
        },
    }];
};

const CreateEmployeeCommandHandler = CommandHandler<CreateEmployeeState, EmployeeOnboardingEvents>({
    evolve,
    initialState: CreateEmployeeInitialState,
});

export const handleCreateEmployee = async (command: CreateEmployeeCommand) => {
    const eventStore = await findEventstore();
    const employeeId = generateEmployeeId();
    const streamId = `employee-onboarding-${employeeId}`;
    const result = await CreateEmployeeCommandHandler(
        eventStore,
        streamId,
        (state: CreateEmployeeState) => decide(command, state, employeeId),
    );
    return {
        nextExpectedStreamVersion: result.nextExpectedStreamVersion,
        lastEventGlobalPosition: result.lastEventGlobalPosition,
        newEvents: result.newEvents,
    };
};

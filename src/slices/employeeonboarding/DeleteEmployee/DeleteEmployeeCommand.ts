import type {Command} from '@event-driven-io/emmett';
import {CommandHandler} from '@event-driven-io/emmett';
import {type EmployeeOnboardingEvents} from '../EmployeeOnboardingEvents';
import {findEventstore} from '../../../common/loadPostgresEventstore';

export type DeleteEmployeeCommand = Command<'DeleteEmployee', {
    employee_id: string;
}, {
    correlation_id?: string;
    causation_id?: string;
}>;

export type DeleteEmployeeState = {
    exists: boolean;
};

export const DeleteEmployeeInitialState = (): DeleteEmployeeState => ({
    exists: false,
});

export const evolve = (
    state: DeleteEmployeeState,
    event: EmployeeOnboardingEvents,
): DeleteEmployeeState => {
    const {type} = event;

    switch (type) {
        case 'EmployeeCreated':
            return {exists: true};
        case 'EmployeeDeleted':
            return {exists: false};
        default:
            return state;
    }
};

export const decide = (
    command: DeleteEmployeeCommand,
    state: DeleteEmployeeState,
): EmployeeOnboardingEvents[] => {
    if (!command.data.employee_id) {
        throw {code: 'employee_id_required', message: 'employee_id is required'};
    }

    if (!state.exists) {
        throw {code: 'employee_not_found', message: 'Employee has already been deleted'};
    }

    return [{
        type: 'EmployeeDeleted',
        data: {
            employee_id: command.data.employee_id,
        },
        metadata: {
            correlation_id: command.metadata?.correlation_id,
            causation_id: command.metadata?.causation_id,
        },
    }];
};

const DeleteEmployeeCommandHandler = CommandHandler<DeleteEmployeeState, EmployeeOnboardingEvents>({
    evolve,
    initialState: DeleteEmployeeInitialState,
});

export const handleDeleteEmployee = async (command: DeleteEmployeeCommand) => {
    const eventStore = await findEventstore();
    const streamId = `employee-onboarding-${command.data.employee_id}`;
    const result = await DeleteEmployeeCommandHandler(
        eventStore,
        streamId,
        (state: DeleteEmployeeState) => decide(command, state),
    );
    return {
        nextExpectedStreamVersion: result.nextExpectedStreamVersion,
        lastEventGlobalPosition: result.lastEventGlobalPosition,
        newEvents: result.newEvents,
    };
};

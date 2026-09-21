"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCreateEmployee = exports.decide = exports.evolve = exports.CreateEmployeeInitialState = void 0;
const emmett_1 = require("@event-driven-io/emmett");
const crypto_1 = require("crypto");
const loadPostgresEventstore_1 = require("../../../common/loadPostgresEventstore");
const CreateEmployeeInitialState = () => ({});
exports.CreateEmployeeInitialState = CreateEmployeeInitialState;
const evolve = (state, _event) => state;
exports.evolve = evolve;
const generateEmployeeId = () => (0, crypto_1.randomUUID)();
const decide = (command, _state, employeeId = generateEmployeeId()) => {
    var _a, _b;
    if (!command.data.employee_first_name) {
        throw { code: 'first_name_required', message: 'First name is required' };
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
                correlation_id: (_a = command.metadata) === null || _a === void 0 ? void 0 : _a.correlation_id,
                causation_id: (_b = command.metadata) === null || _b === void 0 ? void 0 : _b.causation_id,
            },
        }];
};
exports.decide = decide;
const CreateEmployeeCommandHandler = (0, emmett_1.CommandHandler)({
    evolve: exports.evolve,
    initialState: exports.CreateEmployeeInitialState,
});
const handleCreateEmployee = (command) => __awaiter(void 0, void 0, void 0, function* () {
    const eventStore = yield (0, loadPostgresEventstore_1.findEventstore)();
    const employeeId = generateEmployeeId();
    const streamId = `employee-onboarding-${employeeId}`;
    const result = yield CreateEmployeeCommandHandler(eventStore, streamId, (state) => (0, exports.decide)(command, state, employeeId));
    return {
        nextExpectedStreamVersion: result.nextExpectedStreamVersion,
        lastEventGlobalPosition: result.lastEventGlobalPosition,
        newEvents: result.newEvents,
    };
});
exports.handleCreateEmployee = handleCreateEmployee;

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
exports.api = void 0;
const CreateEmployeeCommand_1 = require("./CreateEmployeeCommand");
const api = () => (router) => {
    /**
     * @openapi
     * /api/createemployee:
     *   post:
     *     tags: [Employee Onboarding]
     *     summary: Create Employee
     *     description: Creates a new employee record with basic information.
     *     parameters:
     *       - in: header
     *         name: correlation_id
     *         required: false
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [employee_first_name, employee_last_name, employee_role]
     *             properties:
     *               employee_first_name:
     *                 type: string
     *                 example: Tom
     *               employee_last_name:
     *                 type: string
     *                 example: Becker
     *               employee_role:
     *                 type: string
     *                 example: cooker
     *     responses:
     *       '201':
     *         description: Accepted — EmployeeCreated appended
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 employee_id:
     *                   type: string
     *                 next_expected_stream_version:
     *                   type: string
     *                 last_event_global_position:
     *                   type: string
     *       '409':
     *         description: First name is required
     *       '500':
     *         description: Server error
     */
    router.post('/api/createemployee', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const correlationId = req.header('correlation_id');
        try {
            const command = {
                type: 'CreateEmployee',
                data: {
                    employee_first_name: req.body.employee_first_name,
                    employee_last_name: req.body.employee_last_name,
                    employee_role: req.body.employee_role,
                },
                metadata: {
                    correlation_id: correlationId,
                },
            };
            const result = yield (0, CreateEmployeeCommand_1.handleCreateEmployee)(command);
            const employeeCreated = result.newEvents[0];
            if (correlationId)
                res.set('correlation_id', correlationId);
            return res.status(201).json({
                ok: true,
                employee_id: employeeCreated.data.employee_id,
                next_expected_stream_version: (_a = result.nextExpectedStreamVersion) === null || _a === void 0 ? void 0 : _a.toString(),
                last_event_global_position: (_b = result.lastEventGlobalPosition) === null || _b === void 0 ? void 0 : _b.toString(),
            });
        }
        catch (err) {
            const errorMessage = errorMapping(err === null || err === void 0 ? void 0 : err.code);
            if (errorMessage) {
                return res.status(409).json({ error: errorMessage });
            }
            console.error(err);
            return res.status(500).json({ ok: false, error: 'Server error' });
        }
    }));
};
exports.api = api;
const errorMapping = (code) => {
    switch (code) {
        case 'first_name_required': return 'First name is required';
        default: return null;
    }
};

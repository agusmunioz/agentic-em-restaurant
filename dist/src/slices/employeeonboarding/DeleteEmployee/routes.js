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
const DeleteEmployeeCommand_1 = require("./DeleteEmployeeCommand");
const api = () => (router) => {
    /**
     * @openapi
     * /api/deleteemployee/{id}:
     *   post:
     *     tags: [Employee Onboarding]
     *     summary: Delete Employee
     *     description: Deletes an existing employee by its employee id.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The employee_id of the employee to delete
     *       - in: header
     *         name: correlation_id
     *         required: false
     *         schema:
     *           type: string
     *     responses:
     *       '201':
     *         description: Accepted — EmployeeDeleted appended
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 next_expected_stream_version:
     *                   type: string
     *                 last_event_global_position:
     *                   type: string
     *       '409':
     *         description: employee_id is required, or the employee has already been deleted
     *       '500':
     *         description: Server error
     */
    router.post('/api/deleteemployee/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const id = req.params.id;
        const correlationId = req.header('correlation_id');
        try {
            const command = {
                type: 'DeleteEmployee',
                data: {
                    employee_id: id,
                },
                metadata: {
                    correlation_id: correlationId,
                },
            };
            const result = yield (0, DeleteEmployeeCommand_1.handleDeleteEmployee)(command);
            if (correlationId)
                res.set('correlation_id', correlationId);
            return res.status(201).json({
                ok: true,
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
        case 'employee_id_required': return 'employee_id is required';
        case 'employee_not_found': return 'Employee has already been deleted';
        default: return null;
    }
};

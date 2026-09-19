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
const AddTableCommand_1 = require("./AddTableCommand");
const api = () => (router) => {
    /**
     * @openapi
     * /api/addtable:
     *   post:
     *     tags: [Table Configuration]
     *     summary: Add Table
     *     description: Adds a new table with a unique table number and seat count.
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
     *             required: [table_number, seats]
     *             properties:
     *               table_number:
     *                 type: integer
     *                 example: 1
     *               seats:
     *                 type: integer
     *                 example: 4
     *     responses:
     *       '201':
     *         description: Accepted — TableAdded appended
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 table_id:
     *                   type: string
     *                 next_expected_stream_version:
     *                   type: string
     *                 last_event_global_position:
     *                   type: string
     *       '409':
     *         description: A table with the same number already exists, or seats is not bigger than zero
     *       '500':
     *         description: Server error
     */
    router.post('/api/addtable', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const correlationId = req.header('correlation_id');
        try {
            const command = {
                type: 'AddTable',
                data: {
                    table_number: req.body.table_number,
                    seats: req.body.seats,
                },
                metadata: {
                    correlation_id: correlationId,
                },
            };
            const result = yield (0, AddTableCommand_1.handleAddTable)(command);
            const tableAdded = result.newEvents[0];
            if (correlationId)
                res.set('correlation_id', correlationId);
            return res.status(201).json({
                ok: true,
                table_id: tableAdded.data.table_id,
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
        case 'table_number_not_unique': return 'A table with the same number already exists';
        case 'seats_not_positive': return 'Seats must be bigger than zero';
        default: return null;
    }
};

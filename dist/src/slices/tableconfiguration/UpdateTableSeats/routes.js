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
const UpdateTableSeatsCommand_1 = require("./UpdateTableSeatsCommand");
const api = () => (router) => {
    /**
     * @openapi
     * /api/updatetableseats/{id}:
     *   post:
     *     tags: [Table Configuration]
     *     summary: Update Table Seats
     *     description: Updates the seat count of an existing table.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The table_id of the table to update
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
     *             required: [seats]
     *             properties:
     *               seats:
     *                 type: integer
     *                 example: 6
     *     responses:
     *       '201':
     *         description: Accepted — TableSeatsUpdated appended
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
     *       '500':
     *         description: Server error
     */
    router.post('/api/updatetableseats/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const id = req.params.id;
        const correlationId = req.header('correlation_id');
        try {
            const command = {
                type: 'UpdateTableSeats',
                data: {
                    table_id: id,
                    seats: req.body.seats,
                },
                metadata: {
                    correlation_id: correlationId,
                },
            };
            const result = yield (0, UpdateTableSeatsCommand_1.handleUpdateTableSeats)(command);
            if (correlationId)
                res.set('correlation_id', correlationId);
            return res.status(201).json({
                ok: true,
                next_expected_stream_version: (_a = result.nextExpectedStreamVersion) === null || _a === void 0 ? void 0 : _a.toString(),
                last_event_global_position: (_b = result.lastEventGlobalPosition) === null || _b === void 0 ? void 0 : _b.toString(),
            });
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ ok: false, error: 'Server error' });
        }
    }));
};
exports.api = api;

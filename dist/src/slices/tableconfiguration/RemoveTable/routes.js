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
const RemoveTableCommand_1 = require("./RemoveTableCommand");
const api = () => (router) => {
    /**
     * @openapi
     * /api/removetable/{id}:
     *   post:
     *     tags: [Table Configuration]
     *     summary: Remove Table
     *     description: Removes an existing table by its table id.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The table_id of the table to remove
     *       - in: header
     *         name: correlation_id
     *         required: false
     *         schema:
     *           type: string
     *     responses:
     *       '201':
     *         description: Accepted — TableRemoved appended
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
     *         description: Unable to remove non existing table
     *       '500':
     *         description: Server error
     */
    router.post('/api/removetable/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const id = req.params.id;
        const correlationId = req.header('correlation_id');
        try {
            const command = {
                type: 'RemoveTable',
                data: {
                    table_id: id,
                },
                metadata: {
                    correlation_id: correlationId,
                },
            };
            const result = yield (0, RemoveTableCommand_1.handleRemoveTable)(command);
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
        case 'table_not_found': return 'Unable to remove non existing table';
        default: return null;
    }
};

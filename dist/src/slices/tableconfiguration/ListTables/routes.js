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
const db_1 = require("../../../common/db");
const ListTablesProjection_1 = require("./ListTablesProjection");
const api = () => (router) => {
    /**
     * @openapi
     * /api/query/listtables-collection:
     *   get:
     *     tags: [Table Configuration]
     *     summary: List Tables
     *     description: Lists every configured table with its table number and seat count.
     *     parameters:
     *       - in: query
     *         name: _id
     *         required: false
     *         schema:
     *           type: string
     *         description: When set, returns the single row with this table_id instead of the full collection
     *     responses:
     *       '200':
     *         description: The Tables read model
     *         content:
     *           application/json:
     *             schema:
     *               oneOf:
     *                 - $ref: '#/components/schemas/TablesReadModel'
     *                 - type: array
     *                   items:
     *                     $ref: '#/components/schemas/TablesReadModel'
     *       '500':
     *         description: Server error
     * components:
     *   schemas:
     *     TablesReadModel:
     *       type: object
     *       properties:
     *         table_id:
     *           type: string
     *         table_number:
     *           type: integer
     *         seats:
     *           type: integer
     */
    router.get('/api/query/listtables-collection', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const db = (0, db_1.getKnexInstance)();
            const id = (_a = req.query._id) === null || _a === void 0 ? void 0 : _a.toString();
            const data = id
                ? yield db(ListTablesProjection_1.tableName).withSchema('public').where({ table_id: id }).first()
                : yield db(ListTablesProjection_1.tableName).withSchema('public').select();
            return res.status(200).json(data !== null && data !== void 0 ? data : (id ? null : []));
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ ok: false, error: 'Server error' });
        }
    }));
};
exports.api = api;

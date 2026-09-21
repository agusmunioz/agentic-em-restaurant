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
const ActiveEmployeesProjection_1 = require("./ActiveEmployeesProjection");
const api = () => (router) => {
    /**
     * @openapi
     * /api/query/listactiveemployees-collection:
     *   get:
     *     tags: [Employee Onboarding]
     *     summary: List Active Employees
     *     description: Lists every active employee with their name and role.
     *     parameters:
     *       - in: query
     *         name: _id
     *         required: false
     *         schema:
     *           type: string
     *         description: When set, returns the single row with this employee_id instead of the full collection
     *     responses:
     *       '200':
     *         description: The Active Employees read model
     *         content:
     *           application/json:
     *             schema:
     *               oneOf:
     *                 - $ref: '#/components/schemas/ActiveEmployeesReadModel'
     *                 - type: array
     *                   items:
     *                     $ref: '#/components/schemas/ActiveEmployeesReadModel'
     *       '500':
     *         description: Server error
     * components:
     *   schemas:
     *     ActiveEmployeesReadModel:
     *       type: object
     *       properties:
     *         employee_id:
     *           type: string
     *         employee_first_name:
     *           type: string
     *         employee_last_name:
     *           type: string
     *         employee_role:
     *           type: string
     */
    router.get('/api/query/listactiveemployees-collection', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const db = (0, db_1.getKnexInstance)();
            const id = (_a = req.query._id) === null || _a === void 0 ? void 0 : _a.toString();
            const data = id
                ? yield db(ActiveEmployeesProjection_1.tableName).withSchema('public').where({ employee_id: id }).first()
                : yield db(ActiveEmployeesProjection_1.tableName).withSchema('public').select();
            return res.status(200).json(data !== null && data !== void 0 ? data : (id ? null : []));
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ ok: false, error: 'Server error' });
        }
    }));
};
exports.api = api;

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDb = exports.getSharedPool = exports.getKnexInstance = exports.postgresUrl = void 0;
const knex_1 = __importDefault(require("knex"));
const pg_1 = __importDefault(require("pg"));
exports.postgresUrl = (_a = process.env.DATABASE_URL) !== null && _a !== void 0 ? _a : "missing-url";
let knexInstance = null;
let sharedPool = null;
const getKnexInstance = () => {
    if (!knexInstance) {
        knexInstance = (0, knex_1.default)({
            client: 'pg',
            connection: exports.postgresUrl,
            pool: { min: 0, max: 5 },
        });
    }
    return knexInstance;
};
exports.getKnexInstance = getKnexInstance;
const getSharedPool = () => {
    if (!sharedPool) {
        sharedPool = new pg_1.default.Pool({ connectionString: exports.postgresUrl, max: 5 });
    }
    return sharedPool;
};
exports.getSharedPool = getSharedPool;
const closeDb = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (knexInstance === null || knexInstance === void 0 ? void 0 : knexInstance.destroy());
    yield (sharedPool === null || sharedPool === void 0 ? void 0 : sharedPool.end());
    knexInstance = null;
    sharedPool = null;
});
exports.closeDb = closeDb;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonBigIntReplacer = void 0;
exports.sanitize = sanitize;
function sanitizeValue(value) {
    if (typeof value === 'bigint') {
        return Number.isSafeInteger(Number(value)) ? Number(value) : value.toString();
    }
    if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitizeValue(v)]));
    }
    return value;
}
function sanitize(value) {
    return sanitizeValue(value);
}
const jsonBigIntReplacer = (_key, value) => typeof value === 'bigint'
    ? (Number.isSafeInteger(Number(value)) ? Number(value) : value.toString())
    : value;
exports.jsonBigIntReplacer = jsonBigIntReplacer;

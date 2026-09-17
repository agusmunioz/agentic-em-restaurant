"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertNotEmpty = assertNotEmpty;
function assertNotEmpty(value) {
    if (value === null || value === undefined) {
        throw new Error("Expected non-empty value");
    }
    return value;
}

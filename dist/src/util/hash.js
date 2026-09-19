"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashMeta = hashMeta;
// Fast djb2-style hash of any object — used to detect drift
function hashMeta(entry) {
    const str = JSON.stringify(entry);
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
        h = (((h << 5) + h) ^ str.charCodeAt(i)) >>> 0;
    }
    return h.toString(36);
}

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
exports.storeDlqMessage = void 0;
const db_1 = require("./db");
const storeDlqMessage = (processorId, message, error) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`Processing DLQ ${JSON.stringify({ type: message.type, data: message.data, metadata: message.metadata }, (key, value) => typeof value === 'bigint' ? value.toString() : value)}`);
        yield (0, db_1.getKnexInstance)()('processor_dlq').insert({
            processor_id: processorId,
            stream_id: message.metadata.streamName,
            event: JSON.parse(JSON.stringify({ type: message.type, data: message.data, metadata: message.metadata }, (key, value) => typeof value === 'bigint' ? value.toString() : value)),
            error: error instanceof Error ? error.message : String(error),
        });
    }
    catch (dlqError) {
        console.error('Failed to write to processor_dlq:', dlqError);
    }
});
exports.storeDlqMessage = storeDlqMessage;

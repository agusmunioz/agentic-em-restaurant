"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const emmett_expressjs_1 = require("@event-driven-io/emmett-expressjs");
const glob_1 = require("glob");
const express_1 = __importDefault(require("express"));
const sanitize_1 = require("./src/util/sanitize");
const db_1 = require("./src/common/db");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./src/swagger");
const cors_1 = __importDefault(require("cors"));
const loadPostgresEventstore_1 = require("./src/common/loadPostgresEventstore");
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const eventStore = yield (0, loadPostgresEventstore_1.findEventstore)();
        const slicesBase = (0, path_1.join)(__dirname, 'dist/src/slices');
        const routesPattern = (0, path_1.join)(slicesBase, '**/routes{,-*}.js');
        const routeFiles = yield (0, glob_1.glob)(routesPattern, { nodir: true });
        console.log('Found route files:', routeFiles);
        const processorPattern = (0, path_1.join)(slicesBase, '**/processor{,-*}.js');
        const processorFiles = yield (0, glob_1.glob)(processorPattern, { nodir: true });
        console.log('Found processor files:', processorFiles);
        const commonPattern = (0, path_1.join)(__dirname, 'src/common/routes{,-*}.@(ts|js)');
        const commonRouteFiles = yield (0, glob_1.glob)(commonPattern, { nodir: true });
        console.log('Found common route files:', commonRouteFiles);
        const rootApp = (0, express_1.default)();
        rootApp.set('json replacer', sanitize_1.jsonBigIntReplacer);
        const corsOrigins = (_b = (_a = process.env.CORS_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(',').map(o => o.trim())) !== null && _b !== void 0 ? _b : ['http://localhost:3000', 'http://localhost:3001'];
        rootApp.use((0, cors_1.default)({
            origin: corsOrigins,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Content-Encoding', 'accept-encoding', 'Authorization', 'x-user-id', 'x-causation-id', 'x-correlation-id']
        }));
        const webApis = [];
        for (const file of routeFiles.concat(commonRouteFiles)) {
            const webApiModule = yield Promise.resolve(`${file}`).then(s => __importStar(require(s)));
            if (typeof webApiModule.api == 'function') {
                var module = webApiModule.api();
                webApis.push(module);
            }
            else {
                console.error(`Expected api function to be defined in ${file}`);
            }
        }
        const startedProcessors = [];
        for (const processorFile of processorFiles) {
            const processor = yield Promise.resolve(`${processorFile}`).then(s => __importStar(require(s)));
            if (typeof processor.processor.start == "function") {
                console.log(`starting processor ${processorFile}`);
                processor.processor.start(eventStore).catch(err => console.error(`Processor ${processorFile} failed:`, err));
                startedProcessors.push(processor.processor);
            }
        }
        const shutdown = (signal) => __awaiter(this, void 0, void 0, function* () {
            console.log(`${signal} received, shutting down processors...`);
            yield Promise.allSettled(startedProcessors.map(p => p.stop()));
            yield eventStore.close();
            yield (0, db_1.closeDb)();
            console.log('shutdown complete');
            process.exit(0);
        });
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        // Get the main application from emmett
        const childApp = (0, emmett_expressjs_1.getApplication)({
            apis: webApis,
            disableJsonMiddleware: false,
            enableDefaultExpressEtag: true,
        });
        childApp.set('json replacer', sanitize_1.jsonBigIntReplacer);
        // Swagger UI endpoints
        childApp.use('/api-docs', swagger_ui_express_1.default.serve);
        childApp.get('/api-docs', swagger_ui_express_1.default.setup(swagger_1.specs, {
            swaggerOptions: {
                urls: [
                    {
                        url: '/swagger.json',
                        name: 'JSON',
                    },
                ],
            },
        }));
        // OpenAPI spec endpoint
        childApp.get('/swagger.json', (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(swagger_1.specs);
        });
        const port = parseInt(process.env.PORT || '3000', 10);
        console.log(`> Ready on port ${port}`);
        rootApp.use((req, _res, next) => {
            console.log(`[${req.method}] ${req.path}`);
            next();
        });
        rootApp.use(express_1.default.json());
        rootApp.use(childApp);
        // Start the main application
        (0, emmett_expressjs_1.startAPI)(rootApp, { port: port });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('⛔ Unhandled Rejection:', reason);
            if (reason instanceof Error && reason.stack) {
                console.error('Stack trace:\n', reason.stack);
            }
        });
    });
}
startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

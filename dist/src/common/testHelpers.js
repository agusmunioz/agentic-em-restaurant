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
exports.runFlywayMigrations = runFlywayMigrations;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
function runFlywayMigrations(connectionString) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = new URL(connectionString);
        const jdbcUrl = `jdbc:postgresql://${url.hostname}:${url.port || 5432}${url.pathname}`;
        const user = url.username;
        const password = url.password;
        const tempConfigPath = (0, path_1.join)((0, os_1.tmpdir)(), `flyway-test-${Date.now()}.conf`);
        const migrationsPath = (0, path_1.join)(process.cwd(), 'migrations');
        const config = `
flyway.url=${jdbcUrl}
flyway.user=${user}
flyway.password=${password}
flyway.locations=filesystem:${migrationsPath}
flyway.schemas=public
flyway.placeholderReplacement=false
flyway.validateOnMigrate=true
flyway.cleanDisabled=false
`;
        try {
            (0, fs_1.writeFileSync)(tempConfigPath, config, 'utf8');
            (0, child_process_1.execSync)(`flyway -configFiles=${tempConfigPath} migrate`, {
                stdio: 'pipe',
                encoding: 'utf8'
            });
        }
        catch (error) {
            console.error('Flyway migration failed:', error.message);
            if (error.stdout)
                console.error('STDOUT:', error.stdout);
            if (error.stderr)
                console.error('STDERR:', error.stderr);
            throw new Error(`Flyway migration failed: ${error.message}`);
        }
        finally {
            try {
                (0, fs_1.unlinkSync)(tempConfigPath);
            }
            catch (_a) {
                // ignore
            }
        }
    });
}

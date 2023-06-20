#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const minimist_1 = __importDefault(require("minimist"));
const commands_1 = require("./commands");
const log_1 = require("./log");
const argv = (0, minimist_1.default)(process.argv.slice(2));
run(...argv._);
function run(...args) {
    const command = commands_1.Commands.get(args[0]);
    if (!command) {
        (0, log_1.logError)("Unrecognized command: ", args[0]);
        process.exit(1);
    }
    command.execute(...args.slice(1));
}

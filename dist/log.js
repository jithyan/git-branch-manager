"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logWarn = exports.logHighlight = exports.logError = void 0;
const chalk_1 = __importDefault(require("chalk"));
function logError(msg, ...logs) {
    console.error(chalk_1.default.red(msg), ...logs);
}
exports.logError = logError;
function logHighlight(msg, ...logs) {
    console.log(chalk_1.default.cyan(msg), ...logs);
}
exports.logHighlight = logHighlight;
function logWarn(msg, ...logs) {
    console.log(chalk_1.default.yellow(msg), ...logs);
}
exports.logWarn = logWarn;

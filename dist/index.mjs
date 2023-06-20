#!/usr/bin/env node
"use strict";
import minimist from "minimist";
import { Commands } from "./commands.js";
import { logError } from "./log.js";
const argv = minimist(process.argv.slice(2));
run(...argv._);
function run(...args) {
    const command = Commands.get(args[0]);
    if (!command) {
        logError("Unrecognized command: ", args[0]);
        process.exit(1);
    }
    command.execute(...args.slice(1));
}

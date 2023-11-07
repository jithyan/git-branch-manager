#!/usr/bin/env node
const { cli } = require("./index");
const args = process.argv.slice(2);
cli(args);

#!/usr/bin/env node
const { cli } = require("./index");
const args = process.argv.slice(1);
cli(args);

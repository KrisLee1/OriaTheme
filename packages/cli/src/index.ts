#!/usr/bin/env node
import process from "node:process";
import { runCli } from "./cli.js";

export { runCli } from "./cli.js";

const result = await runCli(process.argv.slice(2));
for (const line of result.lines) process.stdout.write(`${line}\n`);
process.exitCode = result.exitCode;

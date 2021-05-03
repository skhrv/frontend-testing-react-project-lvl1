#!/usr/bin/env node
import { Command } from 'commander/esm.mjs';
import pageLoader from '../src/index.js';

const program = new Command();
program.option('-o, --output <type>', 'path to save file', process.cwd());

program.parse(process.argv);
const options = program.opts();
pageLoader(program.args[0], options.output);

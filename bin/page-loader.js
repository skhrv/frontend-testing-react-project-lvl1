#!/usr/bin/env node
import { Command } from 'commander';
import pageLoader from '../src/index.js';

const program = new Command();
program.option('-o, --output <type>', 'path to save file', process.cwd());

program.parse(process.argv);
const options = program.opts();
pageLoader(program.args[0], options.output)
  .then(() => process.exit(0)).catch(() => process.exit(1));

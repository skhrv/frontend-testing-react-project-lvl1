#!/usr/bin/env node
import program from 'commander';
import pageLoader from '../src/index.js';
import { version, description } from '../package.json';

program
  .version(version, '-v')
  .description(description)
  .option('-o, --output <type>', 'path to save file', process.cwd())
  .arguments('<url>')
  .action((url, options) => {
    pageLoader(url, options.output)
      .then(() => {
        console.log(
          `Page was successfully downloaded into '${options.output}'`,
        );
      }).catch((e) => {
        console.error(e.message);
        process.exit(1);
      });
  })
  .parse(process.argv);

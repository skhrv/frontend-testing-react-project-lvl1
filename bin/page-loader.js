#!/usr/bin/env node
import program from 'commander';
import pageLoader from '../src/index.js';

program
  .version('0.0.1', '-v')
  .description('Local saving of the web page')
  .option('-o, --output <type>', 'path to save file', process.cwd())
  .arguments('<url>')
  .action((url, options) => {
    pageLoader(url, options.output)
      .then((res) => {
        console.log(
          `Page was successfully downloaded '${res.filepath}'`,
        );
      }).catch((e) => {
        console.error(e.message);
        process.exit(1);
      });
  })
  .parse(process.argv);

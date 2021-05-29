// @ts-check
import { promises as fs } from 'fs';
import { log } from './utils.js';

/**
 * @param {string} path
 * @param {string | Uint8Array} data
 */
export default (path, data) => fs.writeFile(path, data).then(() => log(`${path} was successfully saved`));

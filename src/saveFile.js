// @ts-check
import { promises as fs } from 'fs';

/**
 * @param {string} path
 * @param {string | Uint8Array} data
 */
export default (path, data) => fs.writeFile(path, data);

// @ts-check
import { promises as fs } from 'fs';

/**
 * @param {string} path
 * @param {string} data
 */
export default (path, data) => {
  fs.writeFile(path, data);
};

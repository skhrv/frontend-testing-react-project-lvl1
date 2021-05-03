// @ts-check

import { resolve } from 'path';
import pageLoader from './loader.js';
import saveFile from './saveFile.js';
import { getFileNameFromUrl } from './utils.js';

/**
 * @param {string} url
 * @param {string} outputPath
 */
export default (url, outputPath) => pageLoader(url)
  .then((res) => {
    const fileName = getFileNameFromUrl(url);
    const path = resolve(outputPath, fileName);
    saveFile(path, res);
  })
  .catch((e) => {
    console.log(e);
  });

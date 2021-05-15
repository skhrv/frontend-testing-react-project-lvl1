// @ts-check
import { promises as fs } from 'fs';
import { isEmpty } from 'lodash-es';
import { format } from 'path';

/**
 * @param {string} path
 * @param {string | Uint8Array} data
 */
export const saveFile = (path, data) => fs.writeFile(path, data);

/**
 * @param {any[]} loadedImages
 * @param {string} filesDirPath
 * @returns {Promise}
 */
export const saveImages = (loadedImages, filesDirPath) => {
  if (isEmpty(loadedImages)) {
    return Promise.resolve();
  }
  return fs.mkdir(filesDirPath)
    .then(() => Promise.all(loadedImages.map((loadedImg) => {
      const pathToImg = format({ dir: filesDirPath, name: loadedImg.fileName, ext: loadedImg.ext });
      if (loadedImg.data === undefined) {
        return Promise.resolve();
      }
      return saveFile(pathToImg, loadedImg.data);
    })));
};

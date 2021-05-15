// @ts-check
/* eslint-disable import/prefer-default-export */
import axios from 'axios';
import { extname, format, join } from 'path';
import { getNameFromUrl } from './utils.js';

/**
 * @param {any} img
 * @param {string} originUrl
 */
export const loadImage = (img, originUrl, filesDirName) => {
  const { src } = img.attribs;
  const fullURL = new URL(src, originUrl).toString();
  const fileName = getNameFromUrl(fullURL);
  const ext = extname(fullURL);
  const fullFileName = format({ name: fileName, ext });
  const localPath = join(filesDirName, fullFileName);
  return axios(fullURL, { responseType: 'arraybuffer' }).then(({ data }) => ({
    data,
    fileName,
    ext,
    localPath,
  })).catch((e) => e);
};

// @ts-check
import axios from 'axios';
import cheerio from 'cheerio';
import {
  extname, format, join, resolve,
} from 'path';
import chalk from 'chalk';
import { URL } from 'url';
import { promises as fs } from 'fs';
import saveFile from './saveFile.js';
import {
  getResourceUrlAttr,
  getNameFromUrl,
  isLocalURL,
  log,
} from './utils.js';
import 'axios-debug-log';

const greenCheckChar = chalk.green('\u2705 ');

/**
 * @param {string} url
 * @param {string} outputPath
 */
export default (url, outputPath = process.cwd()) => {
  const baseName = getNameFromUrl(url);
  const originUrl = new URL(url).origin;
  return fs
    .access(outputPath)
    .then(() => axios(url).then(({ data: html }) => {
      log(`${url} was successfully loaded`);
      const $ = cheerio.load(html);
      const pathToHtml = format({
        dir: outputPath,
        name: baseName,
        ext: '.html',
      });

      const images = $('img');
      const links = $('link');
      const scripts = $('script');
      const resources = [...images, ...links, ...scripts];
      const localResources = resources.filter((resource) => {
        const linkAttr = getResourceUrlAttr(resource.tagName);
        return isLocalURL(resource.attribs[linkAttr], originUrl);
      });

      if (localResources.length === 0) {
        return saveFile(pathToHtml, html).then(() => html);
      }

      const filesDirName = `${baseName}_files`;
      const filesDirPath = resolve(outputPath, filesDirName);
      return fs
        .mkdir(filesDirPath)
        .then(() => Promise.all(
          localResources.map((resource) => {
            const linkAttr = getResourceUrlAttr(resource.tagName);
            const resourceUrl = resource.attribs[linkAttr];
            const fullURL = new URL(resourceUrl, originUrl).toString();

            const fileName = getNameFromUrl(fullURL);
            const ext = extname(resourceUrl) || '.html';
            const fullFileName = format({ name: fileName, ext });
            const localPath = join(filesDirName, fullFileName);
            // eslint-disable-next-line no-param-reassign
            resource.attribs[linkAttr] = localPath;

            const pathToResource = format({
              dir: filesDirPath,
              name: fileName,
              ext,
            });
            return axios(fullURL, { responseType: 'arraybuffer' }).then(
              ({ data }) => {
                console.log(`${greenCheckChar} ${fullURL}`);
                log(`${fullURL} was successfully loaded`);

                return saveFile(pathToResource, data);
              },
            );
          }),
        ))
        .then(() => saveFile(pathToHtml, $.html()))
        .then(() => {
          log(`Page was successfully downloaded into '${outputPath}'`);
          console.log(
            `Page was successfully downloaded into '${outputPath}'`,
          );
        });
    })).catch((e) => {
      log(e);
      console.error(e.message);
      throw e;
    });
};

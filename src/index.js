// @ts-check
import cheerio from 'cheerio';
import { isEmpty } from 'lodash-es';
import { format, resolve } from 'path';
import { URL } from 'url';
import loadHtml from './loadHtml.js';
import { loadImage } from './loadImages.js';
import { saveFile, saveImages } from './saveFile.js';
import { getNameFromUrl } from './utils.js';
/**
 * @param {string} url
 * @param {string} outputPath
 */
export default (url, outputPath) => {
  const baseName = getNameFromUrl(url);
  const originUrl = new URL(url).origin;
  return loadHtml(url).then((html) => {
    const pathToHtml = format({
      dir: outputPath,
      name: baseName,
      ext: '.html',
    });
    const $ = cheerio.load(html);
    const images = $('img');
    if (images.length === 0) {
      return saveFile(pathToHtml, html).then(() => html);
    }
    const filesDirName = `${baseName}_files`;
    const filesDirPath = resolve(outputPath, filesDirName);

    return Promise.all(
      images.map((_, image) => loadImage(image, originUrl, filesDirName)
        .then((loadedImage) => {
          // @ts-ignore
          // eslint-disable-next-line no-param-reassign
          image.attribs.src = loadedImage.localPath;
          return loadedImage;
        })),
    )
      .then((loadedImages) => {
        if (isEmpty(loadedImages)) {
          return Promise.resolve();
        }

        return saveImages(loadedImages, filesDirPath).then(() => saveFile(pathToHtml, $.html()));
      });
  }).catch(() => {});
};

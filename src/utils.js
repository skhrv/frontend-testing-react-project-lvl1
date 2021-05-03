// @ts-check
/* eslint-disable import/prefer-default-export */
import { parse } from 'url';

/**
 * @param {string} url
 */
export const getFileNameFromUrl = (url) => {
  const { host, path } = parse(url);
  const fileName = `${host}${path}`.replace(/\W+/g, '-');

  return `${fileName}.html`;
};

// @ts-check
/* eslint-disable import/prefer-default-export */
import { parse, resolve } from 'path';
import { URL } from 'url';

/**
 * @param {string} pathname
 */
const omitExtFromPath = (pathname) => {
  const { dir, name } = parse(pathname);
  return resolve(dir, name);
};

/**
 * @param {string} url
 */
export const getNameFromUrl = (url) => {
  const { host, pathname } = new URL(url);
  const name = `${host}${omitExtFromPath(pathname)}`.replace(/(?=\/$)\W/g, '').replace(/\W+/g, '-');

  return name;
};

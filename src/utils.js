// @ts-check
/* eslint-disable import/prefer-default-export */
import debug from 'debug';
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

/**
 * @param {string} url
 * @param {string} origin
 */
export const isLocalURL = (url, origin) => {
  if (url === undefined) {
    return false;
  }
  return new URL(origin).origin === new URL(url, origin).origin;
};

/**
 * @param {string} tagName
 */
export const getResourceUrlAttr = (tagName) => {
  switch (tagName) {
    case 'img':
    case 'script':
      return 'src';
    case 'link':
      return 'href';
    default:
      throw new Error(`link attr not specified for ${tagName}`);
  }
};

export const log = debug('page-loader');

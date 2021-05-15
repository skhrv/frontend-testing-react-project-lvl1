import { test, expect, beforeAll } from '@jest/globals';
import { promises as fs } from 'fs';
import path from 'path';
import axiosHttpAdapter from 'axios/lib/adapters/http';
import axios from 'axios';
import nock from 'nock';
import os from 'os';
import { fileURLToPath } from 'url';
import pageLoader from '../src/index.js';

nock.disableNetConnect();
axios.defaults.adapter = axiosHttpAdapter;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFile(getFixturePath(filename), 'utf-8');

let tempDirPath;
let beforeHtml;
let beforeImg;
let expectedHtml;
const expectedImgFileName = 'ru-hexlet-io-assets-professions-nodejs.png';
const expectedHtmlFileName = 'ru-hexlet-io-courses.html';
const expectedDirName = 'ru-hexlet-io-courses_files';
beforeAll(async () => {
  beforeHtml = await readFile('before.html');
  beforeImg = await readFile('nodejs.png');
  expectedHtml = await readFile('expected.html');
  tempDirPath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('page loaded and saved with img', async () => {
  const scope = nock('http://ru.hexlet.io')
    .get('/courses')
    .reply(200, beforeHtml)
    .get('/assets/professions/nodejs.png')
    .reply(200, beforeImg);
  await pageLoader('http://ru.hexlet.io/courses', tempDirPath);
  scope.isDone();

  const actual = await fs.readFile(
    path.join(tempDirPath, expectedHtmlFileName),
    'utf-8',
  );
  expect(actual).toEqual(expectedHtml);

  const imgFile = await fs.readFile(
    path.join(tempDirPath, expectedDirName, expectedImgFileName),
    'utf-8',
  );
  expect(imgFile).toBeTruthy();
});

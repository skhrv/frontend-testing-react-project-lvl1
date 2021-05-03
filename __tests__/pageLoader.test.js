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
let expected;
beforeAll(async () => {
  expected = await readFile('1.html');
  tempDirPath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('page load and save', async () => {
  const scope = nock('http://example.com').get('/test').reply(200, expected);
  await pageLoader('http://example.com/test', tempDirPath);
  scope.isDone();
  const actual = await fs.readFile(
    path.join(tempDirPath, 'example-com-test.html'),
    'utf-8',
  );

  expect(actual).toEqual(expected);
});

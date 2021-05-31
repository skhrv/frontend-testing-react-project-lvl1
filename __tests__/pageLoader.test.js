import { promises as fs } from 'fs';
import path from 'path';
import axiosHttpAdapter from 'axios/lib/adapters/http';
import axios from 'axios';
import nock from 'nock';
import os from 'os';
import pageLoader from '../src/index.js';

nock.disableNetConnect();
axios.defaults.adapter = axiosHttpAdapter;

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFile(getFixturePath(filename), 'utf-8');

const expectedDirName = 'ru-hexlet-io-courses_files';
const expectedHtmlFileName = 'ru-hexlet-io-courses.html';
const expectedImgFileName = 'ru-hexlet-io-assets-professions-nodejs.png';
const expectedCssFileName = 'ru-hexlet-io-assets-application.css';
const expectedScriptFileName = 'ru-hexlet-io-packs-js-runtime.js';

let tempDirPath;
let beforeHtml;
let imgFile;
let scriptFile;
let cssFile;
let expectedHtml;

beforeAll(async () => {
  beforeHtml = await readFile('before.html');
  imgFile = await readFile('nodejs.png');
  scriptFile = await readFile('runtime.js');
  cssFile = await readFile('application.css');
  expectedHtml = await readFile('expected.html');
  tempDirPath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

describe('pageLoader', () => {
  it('page loaded and saved with resources', async () => {
    const scope = nock('https://ru.hexlet.io')
      .get('/courses')
      .times(2)
      .reply(200, beforeHtml)
      .get('/assets/professions/nodejs.png')
      .reply(200, imgFile)
      .get('/packs/js/runtime.js')
      .reply(200, scriptFile)
      .get('/assets/application.css')
      .reply(200, cssFile);
    await pageLoader('https://ru.hexlet.io/courses', tempDirPath);
    scope.isDone();

    const actualHtml = await fs.readFile(
      path.join(tempDirPath, expectedHtmlFileName),
      'utf-8',
    );
    expect(actualHtml).toEqual(expectedHtml);

    const actualImgFile = await fs.readFile(
      path.join(tempDirPath, expectedDirName, expectedImgFileName),
      'utf-8',
    );
    expect(actualImgFile).toEqual(imgFile);

    const actualScriptFile = await fs.readFile(
      path.join(tempDirPath, expectedDirName, expectedScriptFileName),
      'utf-8',
    );
    expect(actualScriptFile).toEqual(scriptFile);

    const actualCssFile = await fs.readFile(
      path.join(tempDirPath, expectedDirName, expectedCssFileName),
      'utf-8',
    );
    expect(actualCssFile).toEqual(cssFile);
  });

  it('throw error if page not exist', async () => {
    const scope = nock('https://ru.hexlet.io')
      .get('/courses').reply(500);

    await expect(pageLoader('https://ru.hexlet.io/courses', tempDirPath)).rejects.toThrowError('Request failed with status code 500');
    scope.isDone();
  });

  it('throw error if output dit not exist', async () => {
    await expect(pageLoader('https://ru.hexlet.io/courses', 'notExistedDir')).rejects.toThrowError('ENOENT: no such file or directory, access \'notExistedDir\'');
  });
});

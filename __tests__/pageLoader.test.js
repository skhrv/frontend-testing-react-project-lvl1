import { promises as fs } from 'fs';
import path from 'path';
import nock from 'nock';
import os from 'os';
import pageLoader from '../src/index.js';

nock.disableNetConnect();

// file and dir names
const expectedFixtureDirName = 'expected';
const beforeFixtureDirName = 'before';
const expectedDirName = 'ru-hexlet-io-courses_files';
const expectedHtmlFileName = 'ru-hexlet-io-courses.html';
const htmlFileName = 'courses.html';

// URLs
const baseUrl = 'https://ru.hexlet.io';
const routePath = '/courses';
const fullUrl = `${baseUrl}${routePath}`;

const getFixturePath = (fixtureDirName, filename) => path.join(__dirname, '..', '__fixtures__', fixtureDirName, filename);
const readFile = (fixtureDirName, filename) => fs.readFile(getFixturePath(fixtureDirName, filename), 'utf-8');

const prefix = 'ru-hexlet-io';
const testsResources = [
  {
    fileName: 'courses.html',
    resourceURI: routePath,
    expectedFileName: `${prefix}-courses.html`,
    repeatTimes: 2,
  },
  {
    fileName: 'nodejs.png',
    resourceURI: '/assets/professions/nodejs.png',
    expectedFileName: `${prefix}-assets-professions-nodejs.png`,
    repeatTimes: 1,
  },
  {
    fileName: 'application.css',
    resourceURI: '/assets/application.css',
    expectedFileName: `${prefix}-assets-application.css`,
    repeatTimes: 1,
  },
  {
    fileName: 'runtime.js',
    resourceURI: '/packs/js/runtime.js',
    expectedFileName: `${prefix}-packs-js-runtime.js`,
    repeatTimes: 1,
  },
];

const initMockHttpRequests = async () => {
  const scope = nock(baseUrl);
  await Promise.all(testsResources.map(async ({ fileName, resourceURI, repeatTimes }) => {
    const resourceData = await readFile(beforeFixtureDirName, fileName);
    scope.get(resourceURI).times(repeatTimes).reply(200, resourceData);
  }));

  return scope;
};

let expectedHtml;
beforeAll(async () => {
  expectedHtml = await readFile(expectedFixtureDirName, htmlFileName);
});

let outputTempDirPath;
beforeEach(async () => {
  outputTempDirPath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

describe('pageLoader positive case', () => {
  it('page loaded', async () => {
    await initMockHttpRequests();
    await pageLoader(fullUrl, outputTempDirPath);

    const actualHtml = await fs.readFile(
      path.join(outputTempDirPath, expectedHtmlFileName),
      'utf-8',
    );

    expect(actualHtml).toEqual(expectedHtml);
  });

  it.each(testsResources)(
    'page saved with resource $fileName',
    async ({ fileName, expectedFileName }) => {
      const resourceData = await readFile(beforeFixtureDirName, fileName);
      await initMockHttpRequests();
      await pageLoader(fullUrl, outputTempDirPath);

      const actualResource = await fs.readFile(
        path.join(outputTempDirPath, expectedDirName, expectedFileName),
        'utf-8',
      );
      expect(actualResource).toEqual(resourceData);
    },
  );
});

describe('pageLoader negative case', () => {
  it('throw error if page not exist', async () => {
    const scope = nock(baseUrl).get('/courses').reply(500);

    await expect(
      pageLoader(fullUrl, outputTempDirPath),
    ).rejects.toThrowError('Request failed with status code 500');
    scope.isDone();
  });

  it('throw error if output dir is not exist', async () => {
    await expect(
      pageLoader(fullUrl, 'notExistedDir'),
    ).rejects.toThrowError(/ENOENT/i);
  });

  it('throw error if output dir is not accessible', async () => {
    await fs.chmod(outputTempDirPath, 0);
    await expect(
      pageLoader('https://ru.hexlet.io/courses', outputTempDirPath),
    ).rejects.toThrowError(/EACCES/i);
  });
});

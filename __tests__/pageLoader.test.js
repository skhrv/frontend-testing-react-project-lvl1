import { promises as fs } from 'fs';
import path from 'path';
import nock from 'nock';
import os from 'os';
import pageLoader from '../src/index.js';

nock.disableNetConnect();

const expectedFixtureDirName = 'expected';
const beforeFixtureDirName = 'before';

const getFixturePath = (fixtureDirName, filename) => path.join(__dirname, '..', '__fixtures__', fixtureDirName, filename);
const readFile = (fixtureDirName, filename) => fs.readFile(getFixturePath(fixtureDirName, filename), 'utf-8');

const expectedDirName = 'ru-hexlet-io-courses_files';
const expectedHtmlFileName = 'ru-hexlet-io-courses.html';
const htmlFileName = 'courses.html';

const prefix = 'ru-hexlet-io';
const testData = [
  ['courses.html', '/courses', `${prefix}-courses.html`, 2],
  ['nodejs.png', '/assets/professions/nodejs.png', `${prefix}-assets-professions-nodejs.png`, 1],
  ['application.css', '/assets/application.css', `${prefix}-assets-application.css`, 1],
  ['runtime.js', '/packs/js/runtime.js', `${prefix}-packs-js-runtime.js`, 1],
];

const initMockHttpRequests = async () => {
  const scope = nock('https://ru.hexlet.io');
  await Promise.all(testData.map(async ([fileName, resourceURI, , repeatTimes]) => {
    const resourceData = await readFile(beforeFixtureDirName, fileName);
    scope.get(resourceURI).times(repeatTimes).reply(200, resourceData);
  }));

  return scope;
};

let expectedHtml;
beforeAll(async () => {
  expectedHtml = await readFile(expectedFixtureDirName, htmlFileName);
});

let tempDirPath;
beforeEach(async () => {
  tempDirPath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

describe('pageLoader', () => {
  it.each(testData)(
    'page loaded and saved with resources %s',
    async (fileName, _, expectedFileName) => {
      const resourceData = await readFile(beforeFixtureDirName, fileName);
      const scope = await initMockHttpRequests();
      await pageLoader('https://ru.hexlet.io/courses', tempDirPath);
      scope.isDone();

      const actualHtml = await fs.readFile(
        path.join(tempDirPath, expectedHtmlFileName),
        'utf-8',
      );

      expect(actualHtml).toEqual(expectedHtml);

      const actualResource = await fs.readFile(
        path.join(tempDirPath, expectedDirName, expectedFileName),
        'utf-8',
      );
      expect(actualResource).toEqual(resourceData);
    },
  );

  it('throw error if page not exist', async () => {
    const scope = nock('https://ru.hexlet.io').get('/courses').reply(500);

    await expect(
      pageLoader('https://ru.hexlet.io/courses', tempDirPath),
    ).rejects.toThrowError('Request failed with status code 500');
    scope.isDone();
  });

  it('throw error if output dir is not exist', async () => {
    await expect(
      pageLoader('https://ru.hexlet.io/courses', 'notExistedDir'),
    ).rejects.toThrowError(
      "ENOENT: no such file or directory, access 'notExistedDir'",
    );
  });

  it('throw error if output dir is not accessible', async () => {
    await fs.chmod(tempDirPath, 0);
    await expect(
      pageLoader('https://ru.hexlet.io/courses', tempDirPath),
    ).rejects.toThrowError(
      /EACCES: permission denied/,
    );
  });
});

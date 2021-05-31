import { isLocalURL, getResourceUrlAttr } from '../src/utils';

describe('utils', () => {
  it('isLocalURL', () => {
    expect(isLocalURL('http://example.com/test', 'http://example.com')).toBe(true);
    expect(isLocalURL('/test', 'http://example.com')).toBe(true);
    expect(isLocalURL(undefined, 'http://example.com')).toBe(false);
    expect(isLocalURL('http://example1.com/test', 'http://example.com')).toBe(false);
  });

  it('getResourceUrlAttr', () => {
    expect(getResourceUrlAttr('img')).toBe('src');
    expect(getResourceUrlAttr('script')).toBe('src');
    expect(getResourceUrlAttr('link')).toBe('href');

    expect(() => getResourceUrlAttr('div')).toThrowError('link attr not specified for div');
  });
});

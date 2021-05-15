// @ts-check
import axios from 'axios';

/**
 * @param {string} url
 */
export default (url) => axios(url).then((res) => res.data);

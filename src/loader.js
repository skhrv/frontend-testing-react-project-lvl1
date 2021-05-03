// @ts-check
import axios from 'axios';

/**
 * @param {string} url
 */
export default (url) => axios.get(url).then((res) => res.data);

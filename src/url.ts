export const BASE_URL = 'https://www.goodreads.com';

export const getPage = (url: string) => (/https?:\/\//.test(url) ? url : BASE_URL + url);

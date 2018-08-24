import { URL } from 'whatwg-url';

import fetch from 'node-fetch';

import { JSDOM } from 'jsdom';

export default JSDOM;


global.window = (new JSDOM('', {url: 'http://test.com/'})).window;

global.document = window.document;

global.URL = URL;

window.fetch = fetch;

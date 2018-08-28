import fetch from 'node-fetch';

import { JSDOM } from 'jsdom';

export default JSDOM;


global.window = (new JSDOM('', {
    url:                'http://test.com/',
    pretendToBeVisual:  true
})).window;

global.document = window.document;

global.DOMParser = window.DOMParser;

global.URL = window.URL;

window.fetch = fetch;

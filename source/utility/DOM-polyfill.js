import fetch from 'node-fetch';

import { JSDOM } from 'jsdom';

export default JSDOM;


const { window } = (new JSDOM('', {
    url:                'http://test.com/',
    pretendToBeVisual:  true
}));

global.window = window;

for (let key of [
    'Blob', 'document', 'Element', 'DOMParser',
    'URL', 'URLSearchParams', 'FormData'
])
    global[key] = window[key];

window.fetch = fetch;

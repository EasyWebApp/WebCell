import { JSDOM } from 'jsdom';

import fetch from 'node-fetch';

export default JSDOM;


const { window } = (new JSDOM('', {
    url:                'http://test.com/',
    pretendToBeVisual:  true
}));

for (let key of [
    'window', 'document',
    'Blob', 'Element', 'DOMParser',
    'URL', 'URLSearchParams', 'FormData'
])
    global[key] = window[key];

window.fetch = fetch;

import { JSDOM } from 'jsdom';

import fetch from 'node-fetch';

export default JSDOM;


const { window } = (new JSDOM('', {
    url:                'http://test.com/',
    pretendToBeVisual:  true
}));

for (let key of [
    'self', 'document',
    'Node', 'Element', 'HTMLElement', 'DocumentFragment', 'HTMLDocument',
    'DOMParser', 'XMLSerializer',
    'Event', 'CustomEvent',
    'URL', 'URLSearchParams', 'FormData', 'Blob'
])
    global[key] = window[key];

self.fetch = fetch;

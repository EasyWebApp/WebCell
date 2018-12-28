import { JSDOM } from 'jsdom';

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
    'URL', 'URLSearchParams', 'FormData', 'Blob', 'XMLHttpRequest'
])
    global[key] = window[key];

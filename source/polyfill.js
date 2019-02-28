const { JSDOM } = require('jsdom');

module.exports = JSDOM;


const { window } = (new JSDOM('', {
    url:                'http://test.com/',
    pretendToBeVisual:  true
}));

[
    'self', 'document',
    'Node', 'Element', 'HTMLElement', 'DocumentFragment', 'Document',
    'DOMParser', 'XMLSerializer',
    'Event', 'CustomEvent',
    'URL', 'URLSearchParams', 'FormData', 'Blob', 'XMLHttpRequest'
].forEach(
    key  =>  global[key] = window[key]
);

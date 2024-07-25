import { JSDOM } from 'jsdom';

const { window } = new JSDOM();

for (const key of [
    'self',
    'document',
    'customElements',
    'HTMLElement',
    'HTMLUnknownElement',
    'XMLSerializer',
    'CustomEvent'
])
    globalThis[key] = window[key];

self.requestAnimationFrame = setTimeout;

import 'core-js/es/object/from-entries';
import 'core-js/es/array/flat';
import 'element-internals-polyfill';
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
]) {
    // @ts-ignore
    global[key] = window[key];
}

self.requestAnimationFrame = setTimeout;

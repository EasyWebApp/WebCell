import { JSDOM } from 'jsdom';

const { window } = new JSDOM();

for (const key of ['document', 'HTMLElement', 'HTMLUnknownElement']) {
    // @ts-ignore
    global[key] = window[key];
}

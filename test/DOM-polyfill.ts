import { JSDOM } from 'jsdom';

const { window } = new JSDOM();

// @ts-ignore
for (const key of ['document']) global[key] = window[key];

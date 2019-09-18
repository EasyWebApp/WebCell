import { Page } from 'puppeteer-core';
import { getPage } from './browser';

var page: Page;

describe('Web Component', () => {
    beforeAll(async () => (page = await getPage()));

    it('should build Shadow DOM', async () => {
        expect(
            await page.$eval(
                'test-tag',
                tag => tag.shadowRoot!.firstElementChild!.outerHTML
            )
        ).toBe('<h1 title="Test" class="title">Test<img alt="Test"></h1>');
    });
});

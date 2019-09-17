import { Page } from 'puppeteer-core';
import { getPage } from './browser';

var page: Page;

describe('Web Component', () => {
    beforeAll(async () => (page = await getPage()));

    it('should have Shadow DOM', async () => {
        expect(
            await page.$eval('test-tag', tag => !!tag.shadowRoot)
        ).toBeTruthy();
    });
});

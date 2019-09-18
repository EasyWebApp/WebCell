import { Page } from 'puppeteer-core';
import { getPage, delay } from './browser';

var page: Page;

describe('Web Component', () => {
    beforeAll(async () => (page = await getPage()));

    it('should build Shadow DOM & combine Function Component', async () => {
        expect(
            await page.$eval(
                'sub-tag',
                tag => tag.shadowRoot!.firstElementChild!.outerHTML
            )
        ).toBe('<div><span></span></div>');
    });

    it('should build Shadow DOM & create Class Component', async () => {
        expect(
            await page.$eval(
                'test-tag',
                tag => tag.shadowRoot!.firstElementChild!.outerHTML
            )
        ).toBe(
            '<h1 title="Test" class="title">Test<img alt="Test"><sub-tag></sub-tag></h1>'
        );
    });

    it('should bind Event Handler', async () => {
        await page.$eval('test-tag', tag =>
            tag.shadowRoot!.querySelector('img')!.click()
        );

        await delay();

        expect(
            await page.$eval(
                'test-tag',
                tag => tag.shadowRoot!.firstElementChild!.outerHTML
            )
        ).toBe(
            '<h1 title="Example" class="title">Example<img alt="Example"><sub-tag></sub-tag></h1>'
        );
    });

    it('should observe Attribute', async () => {
        await page.$eval('test-tag', tag =>
            tag.setAttribute('title', 'Sample')
        );

        await delay();

        expect(
            await page.$eval(
                'test-tag',
                tag => tag.shadowRoot!.firstElementChild!.outerHTML
            )
        ).toBe(
            '<h1 title="Sample" class="title">Sample<img alt="Sample"><sub-tag></sub-tag></h1>'
        );
    });
});

import { Page } from 'puppeteer-core';
import { getPage, delay } from './browser';

import { WebCellComponent } from '../dist';

var page: Page;

describe('Web Component', () => {
    beforeAll(async () => (page = await getPage()));

    it('should render Children & combine Function Component', async () => {
        expect(
            await page.$eval('sub-tag', (tag: Element) => tag.innerHTML)
        ).toBe('<span>test</span>');
    });

    it('should build Shadow DOM & create Class Component', async () => {
        expect(
            await page.$eval(
                'test-tag',
                tag =>
                    (tag as WebCellComponent).shadowRoot!.children[1]!.outerHTML
            )
        ).toBe(
            '<h1 title="Test" class="title">Test<img alt="Test"><sub-tag><span>test</span></sub-tag></h1>'
        );

        expect(
            await page.$eval(
                'test-tag',
                tag => tag.shadowRoot!.firstElementChild!.textContent
            )
        ).toMatch('lightblue');
    });

    it('should bind Event Handler', async () => {
        await page.$eval('test-tag', tag =>
            tag.shadowRoot!.querySelector('img')!.click()
        );

        await delay();

        expect(
            await page.$eval('test-tag', tag => {
                const root = (tag as WebCellComponent).shadowRoot!.children[1]!;

                return [root.outerHTML, getComputedStyle(root).color];
            })
        ).toStrictEqual(
            expect.arrayContaining([
                '<h1 title="Example" class="title active">Example<img alt="Example"><sub-tag><span>test</span></sub-tag></h1>',
                'rgb(255, 182, 193)'
            ])
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
                tag =>
                    (tag as WebCellComponent).shadowRoot!.children[1]!.outerHTML
            )
        ).toBe(
            '<h1 title="Sample" class="title active">Sample<img alt="Sample"><sub-tag><span>test</span></sub-tag></h1>'
        );
    });
});

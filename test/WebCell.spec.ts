import { Page } from 'puppeteer-core';
import { getPage, delay } from './browser';

import { WebCellComponent } from '../dist';

var page: Page;

async function assertShadowDOM(tagName: string, HTML: string) {
    expect(
        await page.$eval(
            tagName,
            (tag: WebCellComponent) => tag.shadowRoot!.children[1]!.outerHTML
        )
    ).toBe(HTML);
}

describe('Web Component', () => {
    beforeAll(async () => (page = await getPage()));

    it('should render Children & combine Function Component', async () => {
        expect(
            await page.$eval('sub-tag', (tag: Element) => tag.innerHTML)
        ).toBe('<span>test</span>');
    });

    it('should build Shadow DOM & create Class Component', async () => {
        await assertShadowDOM(
            'test-tag',
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

    it('should synchronize Attributes & Properties', async () => {
        await page.$eval('test-tag', tag =>
            tag.setAttribute('title', 'Sample')
        );

        await delay();

        await assertShadowDOM(
            'test-tag',
            '<h1 title="Sample" class="title active">Sample<img alt="Sample"><sub-tag><span>test</span></sub-tag></h1>'
        );

        await page.$eval(
            'test-tag',
            (tag: WebCellComponent) => (tag.title = 'Demo')
        );

        expect(
            await page.$eval('test-tag', tag => tag.getAttribute('title'))
        ).toBe('Demo');
    });
});

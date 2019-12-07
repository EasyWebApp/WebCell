import { Browser, Page, EvaluateFn, launch } from 'puppeteer-core';
import { join } from 'path';

const { npm_config_chrome } = process.env;

var browser: Browser, page: Page;

export async function getPage(
    path = './test/index.html',
    initEval?: EvaluateFn
) {
    browser = browser || (await launch({ executablePath: npm_config_chrome }));

    page = page || (await browser.pages())[0];

    if (initEval instanceof Function)
        await page.evaluateOnNewDocument(initEval);

    await page.goto('file:///' + join(process.cwd(), path));

    return page;
}

export function delay(seconds = 0.1) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

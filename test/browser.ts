import { Browser, Page, launch } from 'puppeteer-core';
import { join } from 'path';

const { npm_config_chrome } = process.env;

var browser: Browser, page: Page;

export async function getPage(path = './test/index.html') {
    browser = browser || (await launch({ executablePath: npm_config_chrome }));

    page = page || (await browser.pages())[0];

    await page.goto('file:///' + join(process.cwd(), path));

    return page;
}

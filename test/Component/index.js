import PuppeteerBrowser from 'puppeteer-browser';

var page;

function consoleText() {

    return  new Promise(resolve =>
        page.on('console',  message => resolve( message.text() ))
    );
}


/**
 * @test {Component}
 */
describe('Component mixin',  () => {

    before(async ()  =>
        page = await PuppeteerBrowser.getPage('', 'test/Component/')
    );

    /**
     * @test {component}
     * @test {Component.tagName}
     */
    it('Define Custom element',  () =>

        page.$eval('cell-test',  element => [
            element.constructor.name,
            element.shadowRoot.nodeType
        ]).should.be.fulfilledWith([
            'CellTest', 11
        ])
    );

    /**
     * @test {Component.findTemplate}
     * @test {Component#buildDOM}
     * @test {Component#\$}
     */
    it('Build Shadow DOM',  () =>

        page.$eval('cell-test',  element => {

            const box = element.$('textarea')[0];

            return Array.from(
                element.shadowRoot.children,  element => element.tagName
            ).concat(
                box.value.trim(),  getComputedStyle( box ).fontStyle
            );
        }).should.be.fulfilledWith([
            'LINK',  'TEXTAREA',  'Hello, Web components!', 'italic'
        ])
    );

    /**
     * @test {Component.targetOf}
     * @test {Component.indexOf}
     */
    it('Get the event target in Shadow DOM',  async () => {

        const input = consoleText();

        await page.focus('cell-test');

        await page.$eval('cell-test',  element => element.value = '');

        await page.type('cell-test', 'test');

        (await input).should.be.equal('CELL-TEST TEXTAREA 1');
    });

    /**
     * @test {Component#bubbleOut}
     */
    it('Dispatch events out of Shadow DOM',  async () => {

        const changed = consoleText();

        await page.click('body');

        (await changed).should.be.equal('test');
    });

    /**
     * @test {Component#on}
     */
    it('Delegate DOM events',  async () => {

        const input = consoleText();

        await page.$eval('body',  body => {

            self['web-cell'].Component.prototype.on.call(
                body,  'focusin',  'textarea',  function (event) {

                    console.info(this.tagName, event.type);
                }
            );
        });

        await page.click('cell-test');

        (await input).should.be.equal('TEXTAREA focusin');
    });
});

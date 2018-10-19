import PuppeteerBrowser from 'puppeteer-browser';

import { delay } from '../../source/utility/DOM';


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
            element.constructor.template.nodeType
        ]).should.be.fulfilledWith([
            'CellTest', 11
        ])
    );

    /**
     * @test {Component#buildDOM}
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
            'STYLE',  'TEXTAREA',  'Hello, Web components!', 'italic'
        ])
    );

    /**
     * @test {mapProperty}
     */
    it('Map Attribute to Property',  async () => {

        await page.$eval(
            'cell-test',  element => element.setAttribute('value', 'example')
        );

        (await page.$eval('cell-test',  element => element.value))
            .should.be.equal('example');
    });

    /**
     * @test {mapData}
     */
    it('Map Property to Data',  async () => {

        await page.$eval('cell-test',  element => element.name = 'WebCell');

        await delay(0.05);

        (await page.$eval(
            'cell-test',
            element  =>  element.$('textarea')[0].textContent.trim()
        )).should.be.equal(
            'Hello, WebCell!'
        );
    });

    /**
     * @test {targetOf}
     * @test {indexOf}
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
     * @test {delegate}
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


describe('Form field components',  () => {
    /**
     * @test {InputComponent#changedPropertyOf}
     * @test {watchAttributes}
     */
    it('Render inner field',  async () => {

        const property = await page.$eval('cell-input',  input => {

            const cursor = input.style.getPropertyValue('--input-cursor');

            input = input.shadowRoot.children[0];

            return {
                type:         input.type,
                value:        input.value,
                readOnly:     input.readOnly,
                placeholder:  input.placeholder,
                cursor
            };
        });

        property.should.be.eql({
            type:         'text',
            value:        '1',
            readOnly:     true,
            placeholder:  'test',
            cursor:       'default'
        });
    });

/*
    it('Update outer field while typing',  async () => {

        var proxy = await page.$('cell-input');

        proxy = await proxy.getProperty('shadowRoot');

        proxy = await proxy.$('input');

        await proxy.type('Hello, WebCell !');

        (await page.$eval('cell-input input',  input => input.value))
            .should.be.equal('Hello, WebCell !');
    });*/
});

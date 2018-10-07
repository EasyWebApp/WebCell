import '../../source/utility/DOM-polyfill';

import { readFileSync } from 'fs';

import { parseDOM, stringifyDOM, delay, nextTick } from '../../source/utility/DOM';


describe('DOM utility',  () => {
    /**
     * @test {parseDOM}
     * @test {stringifyDOM}
     */
    it('Parse & Stringify DOM',  () => {

        const HTML = (readFileSync('test/ObjectView/index.html') + '')
            .replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        const fragment = parseDOM( HTML );

        fragment.should.be.class('DocumentFragment');

        stringifyDOM( fragment ).should.be.equal( HTML );
    });

    /**
     * @test {delay}
     * @test {nextTick}
     */
    it('Await next tick',  async () => {

        const tick = nextTick();

        tick.should.be.equal( nextTick() );

        await delay(0.1);

        tick.should.not.be.equal( nextTick() );
    });
});

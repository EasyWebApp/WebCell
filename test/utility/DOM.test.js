import { readFileSync } from 'fs';

import {
    documentReady, parseDOM, stringifyDOM, $, $up, delay, nextTick
} from '../../source/utility/DOM';


describe('DOM utility',  () => {

    var fragment;
    /**
     * @test {documentReady}
     */
    it('DOM ready',  () => documentReady.should.be.resolved());

    /**
     * @test {parseDOM}
     * @test {stringifyDOM}
     */
    it('Parse & Stringify DOM',  () => {

        const HTML = (readFileSync('test/ArrayView/index.html') + '')
            .replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        fragment = parseDOM( HTML );

        fragment.should.be.class('DocumentFragment');

        stringifyDOM( fragment ).should.be.equal( HTML );
    });

    /**
     * @test {\$}
     * @test {\$up}
     */
    it('Search elements up & down',  () => {

        const template = $('template', fragment);

        template.should.have.length(1);

        $up('main', template[0]).should.be.instanceOf( Element );
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

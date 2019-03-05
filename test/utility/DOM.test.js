import { documentReady } from '../../source/utility/event';

import { $, insertTo, documentTypeOf } from '../../source/utility/DOM';

import page from '../Component/index.html';

import { parseDOM, stringifyDOM } from 'dom-renderer';


var document;

describe('DOM utility',  () => {
    /**
     * @test {documentReady}
     */
    it('DOM ready',  () => documentReady.should.be.resolved());

    /**
     * @test {\$}
     */
    it('Search elements up & down',  () => {

        document = parseDOM( page );

        $('input', document).should.have.length(1);
    });

    /**
     * @test {insertTo}
     */
    it('Insert a Node to DOM by index',  () => {

        insertTo(document.body, 'test', -1);

        insertTo(document.body, 'test', 10);

        stringifyDOM( document.body.childNodes ).should.be.equal(`
    <cell-main>
        <cell-test onchange="console.log( this.value )"></cell-test>
    </cell-main>

    test<cell-input>
        <input value="1" readonly="" placeholder="test">
    </cell-input>

test`);
    });

    /**
     * @test {documentTypeOf}
     */
    it('Get Document type of a Node',  () => {

        documentTypeOf( document.createComment('test') )
            .should.be.equal('application/xhtml');
    });
});

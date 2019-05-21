import { documentReady } from '../../source/utility/event';

import { $, documentTypeOf } from '../../source/utility/DOM';

import page from '../Component/index.html';

import { parseDOM } from 'dom-renderer';


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
     * @test {documentTypeOf}
     */
    it('Get Document type of a Node',  () => {

        documentTypeOf( document.createComment('test') )
            .should.be.equal('application/xhtml');
    });
});

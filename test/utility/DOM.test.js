import { documentReady, $, $up } from '../../source/utility/DOM';

import page from '../Component/index.html';

import { parseDOM } from 'dom-renderer';


describe('DOM utility',  () => {
    /**
     * @test {documentReady}
     */
    it('DOM ready',  () => documentReady.should.be.resolved());

    /**
     * @test {\$}
     * @test {\$up}
     */
    it('Search elements up & down',  () => {

        const input = $('input', parseDOM( page ));

        input.should.have.length(1);

        $up('body', input[0]).should.be.instanceOf( Element );
    });
});

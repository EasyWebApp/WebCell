import { readFileSync } from 'fs';

import JSDOM from '../../source/DOM-polyfill';

import View from '../../source/view/View';

import ObjectView from '../../source/view/ObjectView';

import Sinon from 'sinon';

import { nextTick } from '../../source/utility/DOM';

var HTML, fragment = `
    <fieldset>
        <legend title="Test field">
            <label>Test</label>
            <input type="checkbox">
        </legend>
    </fieldset>`.trim();


/**
 * @test {ObjectView}
 */
describe('ObjectView()',  () => {

    before(()  =>  HTML = readFileSync('test/ObjectView/index.html') + '');

    describe('Single view',  () => {

        var view, element;

        before(() => {

            element = JSDOM.fragment( HTML ).querySelector('fieldset');

            element.remove();
        });

        /**
         * @test {ObjectView#scan}
         */
        it('Scan DOM',  () => {

            view = new ObjectView( element );

            view.should.have.length( 3 );
        });

        /**
         * @test {ObjectView#watch}
         * @test {ObjectView#render}
         */
        it('Render data',  () => {

            view.render({
                name:    'Test',
                title:   'Test field',
                enable:  true,
                extra:   'test'
            });

            view.extra.should.be.equal('test');

            view.toString().should.be.equal( fragment );

            view.content.querySelector('input').checked.should.be.true();
        });

        /**
         * @test {ObjectView#valueOf}
         */
        it('Get data',  () => {

            view.valueOf().should.be.eql( view.data );

            view.valueOf().should.not.be.equal( view.data );
        });

        /**
         * @test {ObjectView#commit}
         * @test {ObjectView#watch}
         */
        it('Async render',  async () => {

            view.render = Sinon.spy( view.render );

            view.commit('name', '<b>Example</b>');

            view.title = 'Example field';

            view.render.should.not.be.called();

            view.toString().should.be.equal( fragment );

            await nextTick();

            view.render.should.be.calledOnce();

            view.toString().should.be.equal(
                fragment.replace(/Test(?= )/, 'Example')
                    .replace('Test', '<b>Example</b>')
            );
        });
    });

    describe('Nested view',  () => {

        var view;

        /**
         * @test {ObjectView#scan}
         */
        it('Scan DOM',  () => {

            view = new ObjectView( HTML );

            view.should.have.length( 4 );

            view[3].should.be.instanceof( ObjectView );
        });

        /**
         * @test {View#bindWith}
         * @test {View.instanceOf}
         * @test {ObjectView#watch}
         */
        it('Associate DOM',  () => {

            View.instanceOf( view.content[0] ).should.be.equal( view );

            view.tips.parent.should.be.equal( view );
        });

        /**
         * @test {ObjectView#render}
         */
        it('Render data',  () => {

            view.render({
                name:    'Test',
                title:   'Test field',
                enable:  true,
                tips:    {
                    title:    'Test tips',
                    content:  'Test content'
                }
            });

            view.toString().trim().should.be.equal(`
<form>
    ${fragment}
    <dl data-object="tips">
        <dt>Test tips</dt>
        <dd>Test content</dd>
    </dl>
</form>`.trim()
            );
        });

        /**
         * @test {ObjectView#valueOf}
         */
        it('Get data',  () => {

            view.valueOf().should.be.eql( view.data );

            view.valueOf().should.not.be.equal( view.data );

            view.data.tips.should.be.equal( view.tips.data );

            view.tips.scope.should.be.equal( view.data );
        });
    });
});

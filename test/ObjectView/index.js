import { resolve } from 'path';

import { readFileSync } from 'fs';

import JSDOM from '../../source/utility/DOM-polyfill';

import View from '../../source/view/View';

import ObjectView from '../../source/view/ObjectView';

var HTML;


/**
 * @test {ObjectView}
 */
describe('ObjectView()',  () => {

    before(()  =>  HTML = readFileSync(
        resolve(module.id, '../index.html'),  {encoding: 'utf-8'}
    ));

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

            view.toString().should.be.equal(`
    <fieldset>
        <legend title="Test field">
            Test
            <input type="checkbox">
        </legend>
    </fieldset>`.trim()
            );

            view.content.querySelector('input').checked.should.be.true();
        });

        /**
         * @test {ObjectView#valueOf}
         */
        it('Get data',  () => {

            view.valueOf().should.be.eql( view.data );

            view.valueOf().should.not.be.equal( view.data );
        });
    });

    describe('Nested view',  () => {

        var view;

        /**
         * @test {View.parseDOM}
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
    <fieldset>
        <legend title="Test field">
            Test
            <input type="checkbox">
        </legend>
    </fieldset>
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

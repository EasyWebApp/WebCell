import JSDOM from '../../source/DOM-polyfill';

import {
    serialize, stringify, parse, request, fileTypeOf, blobFrom
} from '../../source/utility/resource';

import WebServer from 'koapache';

import { readFileSync } from 'fs';


describe('Resource utility',  () => {
    /**
     * @test {serialize}
     */
    describe('Serialize "form" or "fieldset" element',  () => {

        const form = JSDOM.fragment(`
<form enctype="application/json">
    <input type="text" name="text" value="example">
    <textarea name="content">sample</textarea>
    <input type="file" name="file">
    <input type="submit">
</form>`
        ).children[0];

        it(
            'Multiple part data',
            ()  =>  serialize( form ).should.be.instanceOf( FormData )
        );

        it('JSON',  () => {

            form.elements.file.remove();

            serialize( form ).should.be.eql({
                text:     'example',
                content:  'sample'
            });
        });

        it('URL encode',  () => {

            form.removeAttribute('enctype');

            serialize( form ).should.be.equal('text=example&content=sample');
        });
    });

    describe('JSON parser',  () => {

        const object = {
                name:     'WebCell',
                time:     new Date('2018-11-10'),
                content:  document.createElement('a')
            },
            string = `{
    "name": "WebCell",
    "time": "2018-11-10T00:00:00.000Z",
    "content": "<a></a>"
}`;
        /**
         * @test {stringify}
         */
        it('Serialization',  () => {

            stringify( object.content ).should.be.equal('"<a></a>"');

            stringify( object ).should.be.equal( string );
        });

        /**
         * @test {parse}
         */
        describe('Parsing',  () => {

            it('Date()',  () => {

                const result = parse('"2018-11-10T00:00:00.000Z"');

                result.should.be.instanceOf( Date );

                result.should.be.eql( object.time );
            });

            it('Element()',  () => {

                const result = parse('"<a />"');

                result.should.be.instanceOf( Element );

                result.should.be.eql( object.content );
            });

            it('Mixin',  () => parse( string ).should.be.eql( object ));
        });
    });

    /**
     * @test {request}
     */
    describe('HTTP request',  () => {

        var server;

        before(async () => {

            server = await (new WebServer('.', 0, true)).workerHost();

            server = `http://${server.address}:${server.port}`;
        });

        it('Get Plain text',  () => request(
            `${server}/ReadMe.md`,
        ).should.be.fulfilledWith(
            readFileSync('ReadMe.md') + ''
        ));

        it('Get JSON object',  () => request(
            `${server}/package.json`,
        ).should.be.fulfilledWith(
            JSON.parse( readFileSync('package.json') )
        ));

        it(
            'Get HTML document',
            async ()  =>  (await request(
                `${server}/test/ObjectView/index.html`,
            )).should.be.class(
                'DocumentFragment'
            )
        );

        it(
            'Get Binary file',
            async ()  =>  (await request(`${server}/docs/image/github.png`))
                .should.be.class('Blob')
        );
    });

    describe('Binary',  () => {

        const data = `data:image/png;base64,${
            readFileSync('docs/image/github.png').toString('base64')
        }`;

        /**
         * @test {fileTypeOf}
         */
        it(
            'Parse Data URI',
            ()  =>  fileTypeOf( data ).should.be.fulfilledWith({
                schema:  'data',
                type:    'png'
            })
        );

        /**
         * @test {blobFrom}
         */
        it(
            'Convert DataURI to Blob',
            ()  =>  blobFrom( data ).should.be.class('Blob')
        );
    });
});

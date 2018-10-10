import JSDOM from '../DOM-polyfill';

import {
    serialize, request, fileTypeOf, blobFrom
} from '../../source/utility/resource';

import WebServer from 'koapache';

import { readFileSync } from 'fs';


describe('Resource utility',  () => {
    /**
     * @test {serialize}
     */
    describe('Serialize <form /> or <fieldset />',  () => {

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

    /**
     * @test {request}
     */
    describe('HTTP request',  () => {

        var server;

        before(async () => {

            server = await (new WebServer()).workerHost();

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

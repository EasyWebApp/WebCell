import { readFileSync } from 'fs';

import JSDOM from '../../source/polyfill';

import WebServer from 'koapache';

import { serialize, parseHeader, request } from '../../source/utility/HTTP';


describe('HTTP utility',  () => {
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

    /**
     * @test {parseHeader}
     */
    it('Parse HTTP headers',  () => {

        parseHeader(
            [
                'content-type: application/json',
                `Link: <https://api.github.com/search/code?q=addClass+user%3Amozilla&page=2>; rel="next",
<https://api.github.com/search/code?q=addClass+user%3Amozilla&page=34>; rel="last"`
            ].join('\r\n')
        ).should.be.eql({
            'Content-Type':  'application/json',
            Link:            {
                next:  {
                    rel:  'next',
                    URI:  'https://api.github.com/search/code?q=addClass+user%3Amozilla&page=2'
                },
                last:  {
                    rel:  'last',
                    URI:  'https://api.github.com/search/code?q=addClass+user%3Amozilla&page=34'
                }
            }
        });
    });

    /**
     * @test {request}
     * @test {bodyOf}
     */
    describe('HTTP request',  () => {

        var server;

        before(async () => {

            server = await (new WebServer('.', 0, true)).workerHost();

            server = `http://${server.address}:${server.port}`;
        });

        it('Get Plain text',  async () => {

            const { body } = await request(`${server}/ReadMe.md`);

            body.should.be.equal(readFileSync('ReadMe.md') + '');
        });

        it('Get JSON object',  async () => {

            const { body } = await request(`${server}/package.json`);

            body.should.be.eql( JSON.parse( readFileSync('package.json') ) );
        });

        it('Get HTML document',  async () => {

            const { body } = await request(`${server}/test/Component/index.html`);

            body.should.be.class('Document');
        });

        it('Get Binary file',  async () => {

            const { body } = await request(`${server}/docs/image/github.png`);

            body.should.be.class('Blob');
        });
    });
});

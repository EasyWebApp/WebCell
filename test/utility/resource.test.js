import {
    stringify, parse, fileTypeOf, blobFrom, parseHash
} from '../../source/utility/resource';

import { readFileSync } from 'fs';


describe('Resource utility',  () => {

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
     * @test {parseHash}
     */
    it('Parse Key-Value string',  () => {

        parseHash(
            '=',  ';',  'a=1; a=2; b=3',
            (key, value) => [key.toUpperCase(), value + '']
        ).should.be.eql({
            A:  ['1', '2'],
            B:  '3'
        });
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

import { multipleMap, extend, mapTree } from '../source/utility/object';

import { request } from '../source/utility/HTTP';

import '../source/utility/DOM-polyfill';

import { readFileSync } from 'fs';

import WebServer from 'koapache';


describe('Utility',  () => {
    /**
     * @test {multipleMap}
     */
    describe('Map & filter',  () => {

        it('Filter `null` & `undefined`',  () => {

            multipleMap(
                [null, undefined, NaN, false, 0, 1],  item => item
            ).should.be.eql([
                NaN, false, 0, 1
            ]);
        });

        it('Merge Array elements into result',  () => {

            multipleMap([[1], [2, 3]],  item => item).should.be.eql([1, 2, 3]);
        });
    });

    /**
     * @test {extend}
     */
    describe('Mixin objects',  () => {

        it('Ordinary objects',  () => {

            Object.keys(extend(
                { },  null,  {
                    example:   1,
                    get test() { },
                    null:       null,
                    undefined:  undefined
                }
            )).should.be.eql([
                'example', 'test'
            ]);
        });

        it('Function or Class',  () => {

            function Test() { }

            class Example {
                constructor(test) {  test;  }

                static test() { }

                test() { }
            }

            extend(Test, Example).should.have.properties({
                name:    'Test',
                length:  0,
                test:    Example.test
            });

            Test.prototype.should.not.be.equal( Example );

            Test.prototype.should.have.property('test', Example.prototype.test);
        });
    });

    /**
     *  @test {mapTree}
     */
    it('Filter object tree',  () => {

        mapTree({
            id:        0,
            children:  [
                {
                    id:        1,
                    children:  [
                        {
                            id:        3,
                            children:  []
                        }
                    ]
                },
                {
                    id:        2,
                    children:  []
                }
            ]
        },  'children',  function (child, index, depth) {

            if (depth < 2)  return child.id;

        }).should.be.eql([1, 2]);
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
            `${server}/ReadMe.markdown`,
        ).should.be.fulfilledWith(
            readFileSync('ReadMe.markdown') + ''
        ));


        it('Get JSON object',  () => request(
            `${server}/package.json`,
        ).should.be.fulfilledWith(
            JSON.parse( readFileSync('package.json') )
        ));


        it('Get HTML document',  async () => {

            (await request(
                `${server}/test/ObjectView/index.html`,
            )).should.be.class(
                'DocumentFragment'
            );
        });
    });
});

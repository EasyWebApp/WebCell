import {
    getPropertyDescriptor,
    arrayLike, multipleMap, unique,
    extend, mapTree, decoratorOf
} from '../../source/utility/object';


describe('Object utility',  () => {
    /**
     * @test {getPropertyDescriptor}
     */
    describe('Get the property descriptor',  () => {

        const object = {test: 1},
            descriptor = {
                value:         1,
                writable:      true,
                enumerable:    true,
                configurable:  true
            };

        it(
            'Own property',
            ()  =>  getPropertyDescriptor(object,  'test')
                .should.be.eql( descriptor )
        );

        it(
            'Property on the prototype chain',
            ()  =>  getPropertyDescriptor(
                Object.create( object ),  'test'
            ).should.be.eql( descriptor )
        );
    });

    /**
     * @test {arrayLike}
     */
    it('Array-like Decoration',  () => {

        @arrayLike
        class List {

            constructor() {  this.length = 0;  }

            @arrayLike
            valueOf() {  return {length: this.length};  }

            @arrayLike
            get items() {  return {length: this.length};  }
        }

        const list = new List(), Array_iterator = [ ][Symbol.iterator];

        list[ Symbol.iterator ].should.equal( Array_iterator );

        list.valueOf()[ Symbol.iterator ].should.equal( Array_iterator );

        list.items[ Symbol.iterator ].should.equal( Array_iterator );
    });

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

            const data = {
                example:   1,
                get test() { },
                null:       null,
                undefined:  undefined
            };

            Object.defineProperty(data,  'hidden',  {value: 1});

            Object.getOwnPropertyNames(
                extend({ },  null,  data)
            ).should.be.eql([
                'example', 'test', 'hidden'
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

        multipleMap(
            mapTree(
                {
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
                },
                'children'
            ),
            ({node, depth}) => {

                if (depth < 2)  return node.id;
            }
        ).should.be.eql([1, 2]);
    });

    /**
     * @test {unique}
     */
    describe('Array deduplication',  () => {

        it('should return new Array',  () => {

            const origin = [ ];

            unique( origin ).should.not.be.equal( origin );
        });

        it(
            'should compare items using "!==" while 0 parameter passed in',
            ()  =>  unique([1, 2, 3, 3, 2, 1]).should.be.eql([1, 2, 3])
        );

        const symbol = Symbol.for('test');

        const origin = [
            {
                id:   1,
                uid:  10000,
            },
            {
                id:        2,
                uid:       10000,
                [symbol]:  'example'
            },
            {
                id:        3,
                uid:       10001,
                [symbol]:  'example'
            }
        ];

        it('should compare items using "!==" by a String or Symbol key',  () => {

            unique(origin, 'uid').should.be.eql([
                {
                    id:   1,
                    uid:  10000,
                },
                {
                    id:   3,
                    uid:  10001,
                }
            ]);

            unique(origin, symbol).should.be.eql([
                {
                    id:   1,
                    uid:  10000,
                },
                {
                    id:        2,
                    uid:       10000,
                    [symbol]:  'example'
                }
            ]);
        });

        it(
            'should reserve an item while the Custom callback return `true`',
            () => unique(
                origin,
                (A, B)  =>  ((A.uid !== B.uid) || (A[symbol] !== B[symbol]))
            ).should.be.eql(
                origin
            )
        );
    });

    /**
     * @test {decoratorOf}
     */
    describe('Create decorator descriptor',  () => {

        it('Static fields',  () => {

            const descriptor = {
                kind:        'field',
                key:         'example',
                placement:   'static'
            };

            const meta = decoratorOf(class Test { },  'example',  'sample');

            meta.should.containEql( descriptor );

            meta.descriptor.enumerable.should.be.true();

            meta.initializer().should.be.equal('sample');
        });

        it('Static methods',  () => {

            const descriptor = {
                kind:        'method',
                key:         'example',
                placement:   'static'
            };

            const meta = decoratorOf(class Test { },  'example',  () => 'sample',  {
                enumerable:  false
            });

            meta.should.containEql( descriptor );

            meta.descriptor.enumerable.should.be.false();

            meta.descriptor.value().should.be.equal('sample');
        });

        it('Static accessors',  () => {

            const descriptor = {
                kind:        'method',
                key:         'example',
                placement:   'static'
            };

            const meta = decoratorOf(class Test { },  'example',  {get: () => 'sample'});

            meta.should.containEql( descriptor );

            meta.descriptor.get().should.be.equal('sample');
        });

        it('Prototype methods',  () => {

            const descriptor = {
                kind:        'method',
                key:         'example',
                placement:   'prototype'
            };

            const meta = decoratorOf(
                (class Test { }).prototype,  'example',  () => 'sample'
            );

            meta.should.containEql( descriptor );

            meta.descriptor.value().should.be.equal('sample');
        });
    });
});

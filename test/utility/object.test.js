import {
    getPropertyDescriptor, multipleMap, extend, mapTree, decoratorOf
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

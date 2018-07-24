import { extend, mapTree } from '../source/WebCell';


describe('Utility',  () => {
    /**
     * @test {extend}
     */
    describe('Mixin objects',  () => {

        it('Ordinary objects',  () => {

            extend(
                { },  null,  {example: 1, get test() { }}
            ).should.have.properties(
                'example', 'test'
            );
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
});

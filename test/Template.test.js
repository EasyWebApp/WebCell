import Template from '../source/view/Template';

import sinon from 'sinon';


/**
 * @test {Template}
 */
describe('Template',  () => {

    /**
     * @test {Template#parse}
     * @test {Template#clear}
     */
    it('Parsing',  () => {

        const template = new Template(
            '[ ${(new Date()).getFullYear()} ]  Hello, ${this.name} !'
        );

        template.should.have.length( 2 );

        template.reference.get('this')[0].should.be.equal('name');

        template.toString().should.be.equal(
            `[ ${(new Date()).getFullYear()} ]  Hello,  !`
        );
    });

    /**
     * @test {Template#evaluate}
     */
    it('Evaluate text',  () => {

        const template = new Template(
            '[ ${this.time} ]  Hello, ${scope.creator}\'s ${view.name} !',
            ['view', 'scope']
        );

        template.should.have.length( 3 );

        template.reference.size.should.be.equal( 3 );

        template.evaluate(
            {time: '2015-07-23'},  {name: 'EasyWebApp.js'},  {creator: 'TechQuery'}
        ).should.be.equal(
            '[ 2015-07-23 ]  Hello, TechQuery\'s EasyWebApp.js !'
        );
    });

    /**
     * @test {Template#evaluate}
     */
    it('Evaluate non-text',  () => {

        function method() { }

        (new Template('${this.method}')).evaluate({ method })
            .should.be.equal( method );
    });

    /**
     * @test {Template#onChange}
     */
    it('Changed callback',  () => {

        const empty = `[ ${(new Date()).getFullYear()} ]  Hello,  !`;

        const onChange = sinon.spy((newValue, oldValue, ...bindData)  =>  {

            if (oldValue === null)
                newValue.should.be.equal( empty );
            else {
                oldValue.should.be.equal( empty );

                newValue.should.be.equal(
                    `[ ${(new Date()).getFullYear()} ]  Hello, EWA !`
                );
            }

            bindData.should.be.eql([1, 2, 3]);
        });

        const template = new Template(
            '[ ${(new Date()).getFullYear()} ]  Hello, ${this.name} !',
            onChange,
            [1, 2, 3]
        );

        template.evaluate({name: 'EWA'});

        onChange.should.have.callCount(2);
    });
});

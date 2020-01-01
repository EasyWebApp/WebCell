import './polyfill';
import { renderToStaticMarkup, createCell, Fragment } from '../dist';

describe('VDOM serializer', () => {
    it('should render VDOM to Markup', () => {
        const source = renderToStaticMarkup(
            <Fragment>
                <div
                    className="test"
                    style={{ color: 'red', zoom: 1 }}
                    data-test="example"
                >
                    test
                    <br />
                    <span>example</span>
                </div>
                sample
            </Fragment>
        );

        expect(source).toBe(
            '<div class="test" style="color: red; zoom: 1" data-test="example">test<br /><span>example</span></div>sample'
        );
    });
});

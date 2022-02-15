import { FunctionComponent } from '../source';
import {
    createCell,
    Fragment,
    render,
    renderToStaticMarkup
} from '../source/renderer';

describe('Renderer', () => {
    it('should render HTML attributes, CSS Styles/Classes & Dataset', () => {
        render(
            <a
                title="Test"
                style={{ color: 'red' }}
                className="btn btn-primary"
                data-toggle="#test"
            >
                Test
            </a>
        );

        expect(document.body.innerHTML.trim()).toBe(
            '<a title="Test" data-toggle="#test" class="btn btn-primary" style="color: red;">Test</a>'
        );
    });

    it('should call Function while DOM rendering', () => {
        const hook = jest.fn();
        const Test = jest.fn(() => <i ref={hook} />) as FunctionComponent<{
            prop1: number;
        }>;
        render(<Test prop1={1}>test</Test>);

        expect(hook).toBeCalledTimes(1);
        expect(Test).toBeCalledWith({ prop1: 1, defaultSlot: ['test'] });
    });

    it('should render SVG attributes, CSS Styles/Classes', () => {
        render(
            <svg viewBox="0 0 300 100">
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    style={{ stroke: 'red', fill: 'grey' }}
                />
            </svg>
        );

        expect(document.body.innerHTML.trim()).toBe(
            '<svg viewBox="0 0 300 100"><circle cx="50" cy="50" r="40" style="stroke: red; fill: grey;"></circle></svg>'
        );
    });

    it('should render VDOM to Markup', () => {
        const source = renderToStaticMarkup(
            <>
                <div
                    className="test"
                    style={{ color: 'red', opacity: '0.5' }}
                    data-test="example"
                >
                    test
                    <br />
                    <span>example</span>
                </div>
                sample
            </>
        );

        expect(source).toBe(
            '<div data-test="example" class="test" style="color: red; opacity: 0.5;">test<br><span>example</span></div>sample'
        );
    });
});

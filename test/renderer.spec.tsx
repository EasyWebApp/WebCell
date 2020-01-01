import './polyfill';
import { createCell, render } from '../dist';

describe('Renderer', () => {
    it('should render HTML attributes, CSS Styles/Classes & Dataset', () => {
        render(
            <a
                title="Test"
                style={{ color: 'red' }}
                className="btn btn-primary"
                data-toggle="#test"
                custom={1}
            >
                Test
            </a>
        );

        expect(document.body.innerHTML.trim()).toBe(
            '<a custom="1" title="Test" data-toggle="#test" class="btn btn-primary" style="color: red;">Test</a>'
        );
    });

    it('should call Function while DOM rendering', () => {
        const hook = jest.fn();
        const Test = jest.fn(() => <a ref={hook} />);

        render(<Test prop1={1}>test</Test>);

        expect(hook).toBeCalledTimes(1);
        expect(Test).toBeCalledWith({ prop1: 1, defaultSlot: ['test'] });
    });

    it('should render SVG attributes, CSS Styles/Classes', () => {
        document.body.innerHTML = '';

        render(
            <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" stroke="red" fill="grey" />
            </svg>
        );

        expect(document.body.innerHTML.trim()).toBe(
            '<svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" stroke="red" fill="grey"></circle></svg>'
        );
    });
});

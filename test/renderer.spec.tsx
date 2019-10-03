import './DOM-polyfill';
import * as WebCell from '../source';

describe('Renderer', () => {
    it('should render HTML attributes, CSS Styles/Classes & Dataset', () => {
        WebCell.render(
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
        const Test = jest.fn(() => <a />);

        WebCell.render(<Test prop1={1}>test</Test>);

        expect(Test).toBeCalledWith({ prop1: 1, children: ['test'] });
    });

    it('should render SVG attributes, CSS Styles/Classes', () => {
        WebCell.render(
            <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" stroke="red" fill="grey" />
            </svg>
        );

        expect(document.body.innerHTML.trim()).toBe(
            '<svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" stroke="red" fill="grey"></circle></svg>'
        );
    });
});

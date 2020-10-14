import { component, watch, attribute, on } from '../source/decorator';
import { mixin, WebCellComponent } from '../source/WebCell';
import { render, createCell } from '../source/renderer';

describe('Base Class & Decorator', () => {
    it('should define a Custom Element', () => {
        @component({ tagName: 'x-first' })
        class XFirst extends mixin() {}

        render(<XFirst />);

        expect(self.customElements.get('x-first')).toBe(XFirst);
        expect(document.body.lastElementChild.tagName).toBe('X-FIRST');
    });

    it('should inject CSS into Shadow Root', () => {
        @component({
            tagName: 'x-second',
            style: {
                h2: { color: 'red' }
            }
        })
        class XSecond extends mixin() {
            render() {
                return <h2 />;
            }
        }

        render(<XSecond />);

        const tag = document.body.lastElementChild as WebCellComponent;

        expect(tag.toString()).toBe(`<style>h2 {
    color: red;
}</style><h2></h2>`);
    });

    it('should put .render() returned DOM into .children of a Custom Element', () => {
        @component({
            tagName: 'x-third',
            renderTarget: 'children'
        })
        class XThird extends mixin() {
            render() {
                return <h2 />;
            }
        }

        render(<XThird />);

        const tag = document.body.lastElementChild;

        expect(tag.shadowRoot).toBeNull();
        expect(tag.innerHTML).toBe('<h2></h2>');
    });

    it('should update Property & Attribute by watch() & attribute() decorators', async () => {
        @component({
            tagName: 'x-fourth',
            renderTarget: 'children'
        })
        class XFourth extends mixin<{ name?: string }>() {
            @attribute
            @watch
            name: string;

            render() {
                return <h2>{this.name}</h2>;
            }
        }

        render(<XFourth />);

        const tag = document.body.lastElementChild as XFourth;

        expect(tag.innerHTML).toBe('<h2></h2>');

        tag.name = 'test';

        expect(tag.name).toBe('test');
        expect(tag.props.name).toBe('test');

        await new Promise(resolve => setTimeout(resolve, 50));

        expect(tag.getAttribute('name')).toBe('test');
        expect(tag.innerHTML).toBe('<h2>test</h2>');

        tag.setAttribute('name', 'example');

        expect(tag.name).toBe('example');
    });

    it('should delegate DOM Event by on() decorator', () => {
        @component({
            tagName: 'x-firth',
            renderTarget: 'children'
        })
        class XFirth extends mixin<{ name?: string }>() {
            @watch
            name: string;

            @on('click', 'h2')
            onClick(
                { type, detail }: CustomEvent<number>,
                { tagName }: HTMLHeadingElement
            ) {
                this.name = [type, tagName, detail] + '';
            }

            render() {
                return (
                    <h2>
                        <a>{this.name}</a>
                    </h2>
                );
            }
        }

        render(<XFirth />);

        const tag = document.body.lastElementChild as XFirth;

        tag.querySelector('a').dispatchEvent(
            new CustomEvent('click', { bubbles: true, detail: 1 })
        );

        expect(tag.name).toBe('click,H2,1');
    });

    it('should be able to prevent Update in .shouldUpdate()', async () => {
        interface XSixthState {
            name?: string;
        }

        @component({ tagName: 'x-sixth' })
        class XSixth extends mixin<{}, XSixthState>() {
            state = {
                name: ''
            };

            shouldUpdate(oldState: XSixthState, { name }: XSixthState) {
                return !name;
            }

            render(_: {}, { name }: XSixthState) {
                return <h2>{name}</h2>;
            }
        }

        render(<XSixth />);

        const tag = document.body.lastElementChild as XSixth;

        await tag.setState({ name: 'test' });

        expect(tag.toString()).toBe('<h2></h2>');
    });
});

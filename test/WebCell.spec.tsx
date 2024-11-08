import 'element-internals-polyfill';

import { DOMRenderer } from 'dom-renderer';
import { configure, observable } from 'mobx';
import { sleep, stringifyCSS } from 'web-utility';

import { attribute, observer } from '../source/decorator';
import { component, on, WebCell, WebCellProps } from '../source/WebCell';

configure({ enforceActions: 'never' });

describe('Base Class & Decorator', () => {
    const renderer = new DOMRenderer();

    it('should define a Custom Element', () => {
        @component({
            tagName: 'x-first',
            mode: 'open'
        })
        class XFirst extends HTMLElement {}

        renderer.render(<XFirst />);

        expect(customElements.get('x-first')).toBe(XFirst);
        expect(document.body.lastElementChild.tagName).toBe('X-FIRST');
    });

    it('should inject CSS into Shadow Root', async () => {
        @component({
            tagName: 'x-second',
            mode: 'open'
        })
        class XSecond extends HTMLElement {
            private innerStyle = stringifyCSS({
                h2: { color: 'red' }
            });

            render() {
                return (
                    <>
                        <style>{this.innerStyle}</style>
                        <h2 />
                    </>
                );
            }
        }
        renderer.render(<XSecond />);

        await sleep();

        const { shadowRoot } = document.body.lastElementChild as XSecond;

        expect(shadowRoot.innerHTML).toBe(`<style>h2 {
    color: red;
}</style><h2></h2>`);
    });

    it('should put .render() returned DOM into .children of a Custom Element', () => {
        @component({ tagName: 'x-third' })
        class XThird extends HTMLElement {
            render() {
                return <h2 />;
            }
        }
        renderer.render(<XThird />);

        const { shadowRoot, innerHTML } = document.body.lastElementChild;

        expect(shadowRoot).toBeNull();
        expect(innerHTML).toBe('<h2></h2>');
    });

    it('should update Property & Attribute by watch() & attribute() decorators', async () => {
        interface XFourthProps extends WebCellProps {
            name?: string;
        }
        interface XFourth extends WebCell<XFourthProps> {}

        @component({ tagName: 'x-fourth' })
        @observer
        class XFourth extends HTMLElement implements WebCell<XFourthProps> {
            @attribute
            @observable
            accessor name: string | undefined;

            render() {
                return <h2>{this.name}</h2>;
            }
        }
        renderer.render(<XFourth />);

        const tag = document.body.lastElementChild as XFourth;

        expect(tag.innerHTML).toBe('<h2></h2>');

        tag.name = 'test';

        expect(tag.name).toBe('test');

        await sleep();

        expect(tag.getAttribute('name')).toBe('test');
        expect(tag.innerHTML).toBe('<h2>test</h2>');

        tag.setAttribute('name', 'example');

        expect(tag.name).toBe('example');
    });

    it('should delegate DOM Event by on() decorator', () => {
        interface XFirthProps extends WebCellProps {
            name?: string;
        }
        interface XFirth extends WebCell<XFirthProps> {}

        @component({ tagName: 'x-firth' })
        @observer
        class XFirth extends HTMLElement implements WebCell<XFirthProps> {
            @observable
            accessor name: string | undefined;

            @on('click', 'h2')
            handleClick(
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
        renderer.render(<XFirth />);

        const tag = document.body.lastElementChild as XFirth;

        tag.querySelector('a').dispatchEvent(
            new CustomEvent('click', { bubbles: true, detail: 1 })
        );
        expect(tag.name).toBe('click,H2,1');
    });

    it('should extend Original HTML tags', () => {
        @component({
            tagName: 'x-sixth',
            extends: 'blockquote',
            mode: 'open'
        })
        class XSixth extends HTMLQuoteElement {
            render() {
                return (
                    <>
                        💖
                        <slot />
                    </>
                );
            }
        }
        renderer.render(<blockquote is="x-sixth">test</blockquote>);

        const element = document.querySelector('blockquote');

        expect(element).toBeInstanceOf(XSixth);
        expect(element).toBeInstanceOf(HTMLQuoteElement);

        expect(element.textContent).toBe('test');
        expect(element.shadowRoot.innerHTML).toBe('💖<slot></slot>');
    });
});

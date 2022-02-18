import 'element-internals-polyfill';
import { sleep, stringifyCSS } from 'web-utility';
import { observable } from 'mobx';

import { component, observer, attribute, on } from '../source/decorator';
import { WebCell } from '../source/WebCell';
import { Fragment, render, createCell } from '../source/renderer';
import type { WebCellProps } from '../source/utility/vDOM';

describe('Base Class & Decorator', () => {
    it('should define a Custom Element', () => {
        @component({
            tagName: 'x-first',
            mode: 'open'
        })
        class XFirst extends WebCell() {}

        render(<XFirst />);

        expect(self.customElements.get('x-first')).toBe(XFirst);
        expect(document.body.lastElementChild.tagName).toBe('X-FIRST');
    });

    it('should inject CSS into Shadow Root', () => {
        @component({
            tagName: 'x-second',
            mode: 'open'
        })
        class XSecond extends WebCell() {
            private innerStyle = (
                <style>
                    {stringifyCSS({
                        h2: { color: 'red' }
                    })}
                </style>
            );

            render() {
                return (
                    <>
                        {this.innerStyle}
                        <h2 />
                    </>
                );
            }
        }
        render(<XSecond />);

        const tag = document.body.lastElementChild as XSecond;

        expect(tag.toString()).toBe(`<style>h2 {
    color: red;
}</style><h2></h2>`);
    });

    it('should put .render() returned DOM into .children of a Custom Element', () => {
        @component({
            tagName: 'x-third'
        })
        class XThird extends WebCell() {
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
            tagName: 'x-fourth'
        })
        @observer
        class XFourth extends WebCell<{ name?: string } & WebCellProps>() {
            @attribute
            @observable
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

        await sleep();

        expect(tag.getAttribute('name')).toBe('test');
        expect(tag.innerHTML).toBe('<h2>test</h2>');

        tag.setAttribute('name', 'example');

        expect(tag.name).toBe('example');
    });

    it('should delegate DOM Event by on() decorator', () => {
        @component({
            tagName: 'x-firth'
        })
        @observer
        class XFirth extends WebCell<{ name?: string } & WebCellProps>() {
            @observable
            name: string;

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

        render(<XFirth />);

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
        class XSixth extends WebCell(HTMLQuoteElement) {
            render() {
                return (
                    <>
                        💖
                        <slot />
                    </>
                );
            }
        }
        render(<blockquote is="x-sixth">test</blockquote>);

        const element = document.querySelector('blockquote');

        expect(element).toBeInstanceOf(XSixth);
        expect(element).toBeInstanceOf(HTMLQuoteElement);

        expect(element.textContent).toBe('test');
        expect(element + '').toBe('💖<slot></slot>');
    });
});

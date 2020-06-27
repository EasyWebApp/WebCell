import { CSSObject, stringifyCSS, toHyphenCase } from './utility';
import { WebCellClass, WebCellComponent } from './WebCell';

export interface ComponentMeta {
    tagName: string;
    extends?: string;
    renderTarget?: 'shadowRoot' | 'children';
    style?: string | CSSObject;
}

export function component({ style, ...meta }: ComponentMeta) {
    return <T extends WebCellClass>(Class: T) => {
        customElements.define(
            meta.tagName,
            Object.assign(Class, {
                style: typeof style === 'object' ? stringifyCSS(style) : style,
                ...meta
            }),
            { extends: meta.extends }
        );

        return Class;
    };
}

export function watch(
    prototype: Object,
    key: string,
    meta?: PropertyDescriptor
) {
    const accessor = !!meta;
    meta = meta || Object.getOwnPropertyDescriptor(prototype, key) || {};

    meta.set =
        meta.set ||
        function (this: WebCellComponent, value) {
            this.setProps({ [key]: value });
        };
    meta.get =
        meta.get ||
        function () {
            return this.props[key];
        };
    (meta.configurable = true), (meta.enumerable = true);

    if (!accessor) Object.defineProperty(prototype, key, meta);
}

export function attribute({ constructor }: Object, key: string) {
    (constructor as WebCellClass).attributes.push(toHyphenCase(key));
}

export interface DOMEventDelegater {
    type: string;
    selector: string;
    method: string;
}

export function on(type: string, selector: string) {
    return ({ constructor }: Object, method: string) => {
        (constructor as WebCellClass).eventDelegaters.push({
            type,
            selector,
            method
        });
    };
}
